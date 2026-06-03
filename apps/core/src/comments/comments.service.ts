import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Comment } from '../entities/comment.entity';
import { Notification } from '../entities/notification.entity';
import { KafkaService } from '../kafka/kafka.service';
import { MentionsService } from '../mentions/mentions.service';
import { CommentDto } from './dto/comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly mentionsService: MentionsService,
    private readonly kafkaService: KafkaService,
  ) {}

  async create(postId: number, commentDto: CreateCommentDto): Promise<CommentDto> {
    const comment = this.commentsRepository.create({
      postId,
      authorProfileId: commentDto.authorProfileId,
      content: commentDto.content,
    });

    const savedComment = await this.commentsRepository.save(comment);

    await this.handleMentions(savedComment);

    this.logger.log(`Comment created: ${savedComment.id}`);

    return this.toCommentDto(savedComment);
  }

  async findAll(): Promise<CommentDto[]> {
    const comments = await this.commentsRepository.find({
      order: { createdAt: 'DESC' },
    });

    return comments.map((comment) => this.toCommentDto(comment));
  }

  async findOne(id: number): Promise<CommentDto> {
    const comment = await this.findCommentById(id);

    return this.toCommentDto(comment);
  }

  async update(id: number, updateCommentDto: UpdateCommentDto): Promise<CommentDto> {
    const comment = await this.findCommentById(id);

    this.updateCommentFieldsPartial(comment, updateCommentDto);
    const savedComment = await this.commentsRepository.save(comment);

    this.logger.log(`Comment updated: ${savedComment.id}`);

    return this.toCommentDto(savedComment);
  }

  async put(id: number, updateCommentDto: UpdateCommentDto): Promise<CommentDto> {
    const comment = await this.findCommentById(id);

    this.updateCommentFieldsFull(comment, updateCommentDto);
    const savedComment = await this.commentsRepository.save(comment);

    this.logger.log(`Comment fully updated: ${savedComment.id}`);

    return this.toCommentDto(savedComment);
  }

  async remove(id: number): Promise<void> {
    await this.findCommentById(id);
    await this.commentsRepository.delete(id);
    this.logger.log(`Comment deleted: ${id}`);
  }

  async like(commentId: number, profileId: number): Promise<void> {
    await this.findCommentById(commentId);
    await this.commentsRepository
      .createQueryBuilder()
      .relation(Comment, 'likes')
      .of(commentId)
      .add(profileId);
  }

  async unlike(commentId: number, profileId: number): Promise<void> {
    await this.findCommentById(commentId);
    await this.commentsRepository
      .createQueryBuilder()
      .relation(Comment, 'likes')
      .of(commentId)
      .remove(profileId);
  }

  private async handleMentions(comment: Comment): Promise<void> {
    const mentions = await this.mentionsService.extractMentions(comment.content);

    for (const mention of mentions) {
      if (mention.mentionedProfileId === comment.authorProfileId) continue;

      const notification = this.notificationRepository.create({
        recipientProfileId: String(mention.mentionedProfileId),
        type: 'mention',
        payload: {
          sourceType: 'comment' as const,
          sourceId: comment.id,
          postId: comment.postId,
          authorProfileId: comment.authorProfileId,
        },
      });

      await this.notificationRepository.save(notification);

      await this.kafkaService.emitMentionEvent({
        sourceType: 'comment',
        sourceId: comment.id,
        authorProfileId: comment.authorProfileId,
        mentionedProfileId: mention.mentionedProfileId,
      });
    }
  }

  private async findCommentById(id: number): Promise<Comment> {
    const comment = await this.commentsRepository.findOneBy({ id });

    if (!comment) {
      throw new NotFoundException('Comment was not found.');
    }

    return comment;
  }

  private updateCommentFieldsPartial(comment: Comment, updateCommentDto: UpdateCommentDto): void {
    if (updateCommentDto.content !== undefined) {
      comment.content = updateCommentDto.content;
    }
  }

  private updateCommentFieldsFull(comment: Comment, updateCommentDto: UpdateCommentDto): void {
    if (updateCommentDto.content !== undefined) {
      comment.content = updateCommentDto.content;
    }
  }

  private toCommentDto(comment: Comment): CommentDto {
    return {
      id: comment.id,
      postId: comment.postId,
      authorProfileId: comment.authorProfileId,
      content: comment.content,
      likesCount: comment.likes?.length,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
