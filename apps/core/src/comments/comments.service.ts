import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { Comment } from '../entities/comment.entity';
import { Notification } from '../entities/notification.entity';
import { NotificationEventsProducer } from '../kafka/notification-events.producer';
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
    private readonly notificationEventsProducer: NotificationEventsProducer,
  ) {}

  async create(postId: number, commentDto: CreateCommentDto): Promise<CommentDto> {
    if (commentDto.parentId != null) {
      const parent = await this.commentsRepository.findOneBy({ id: commentDto.parentId });

      if (!parent) {
        throw new NotFoundException('Parent comment was not found.');
      }
    }

    const comment = this.commentsRepository.create({
      postId,
      authorProfileId: commentDto.authorProfileId,
      content: commentDto.content,
      parentId: commentDto.parentId ?? null,
    });

    const savedComment = await this.commentsRepository.save(comment);

    await this.handleMentions(savedComment);

    this.logger.log(`Comment created: ${savedComment.id}`);

    return this.toCommentDto(savedComment);
  }

  async findAll(): Promise<CommentDto[]> {
    const comments = await this.commentsRepository.find({
      order: { createdAt: 'DESC' },
      relations: ['likes'],
    });

    return comments.map((comment) => this.toCommentDto(comment));
  }

  async findOne(id: number): Promise<CommentDto> {
    const comment = await this.commentsRepository.findOne({
      where: { id },
      relations: ['likes'],
    });

    if (!comment) {
      throw new NotFoundException('Comment was not found.');
    }

    const commentDto = this.toCommentDto(comment);

    commentDto.replies = await this.findReplies(id);

    return commentDto;
  }

  async findByPost(postId: number): Promise<CommentDto[]> {
    const postComments = await this.commentsRepository.find({
      where: { postId },
      order: { createdAt: 'DESC' },
      relations: ['likes'],
    });

    const commentsById = new Map<number, CommentDto>();
    const rootComments: CommentDto[] = [];

    for (const comment of postComments) {
      commentsById.set(comment.id, this.toCommentDto(comment));
    }

    for (const comment of postComments) {
      const commentDto = commentsById.get(comment.id)!;
      const parentDto = comment.parentId != null ? commentsById.get(comment.parentId) : undefined;

      if (parentDto) {
        if (!parentDto.replies) {
          parentDto.replies = [];
        }

        parentDto.replies.push(commentDto);
      } else {
        rootComments.push(commentDto);
      }
    }

    return rootComments;
  }

  async findReplies(commentId: number): Promise<CommentDto[]> {
    const replies = await this.commentsRepository.find({
      where: { parentId: commentId },
      order: { createdAt: 'ASC' },
      relations: ['likes'],
    });

    const result: CommentDto[] = [];

    for (const reply of replies) {
      const replyDto = this.toCommentDto(reply);

      replyDto.replies = await this.findReplies(reply.id);
      result.push(replyDto);
    }

    return result;
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
    const descendantIds = await this.collectDescendantIds(id);

    if (descendantIds.length > 0) {
      await this.commentsRepository.delete(descendantIds);
    }

    await this.commentsRepository.delete(id);
    this.logger.log(`Comment deleted: ${id}`);
  }

  private async collectDescendantIds(commentId: number): Promise<number[]> {
    const ids: number[] = [];
    const children = await this.commentsRepository.find({
      where: { parentId: commentId },
      select: ['id'],
    });

    for (const child of children) {
      const grandchildIds = await this.collectDescendantIds(child.id);

      ids.push(child.id, ...grandchildIds);
    }

    return ids;
  }

  async like(commentId: number, profileId: number): Promise<void> {
    try {
      await this.commentsRepository
        .createQueryBuilder()
        .relation(Comment, 'likes')
        .of(commentId)
        .add(profileId);
    } catch (error: unknown) {
      if (error instanceof QueryFailedError && error.driverError?.code === '23505') return;
      throw error;
    }
  }

  async unlike(commentId: number, profileId: number): Promise<void> {
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
        recipientProfileId: mention.mentionedProfileId,
        type: 'mention',
        payload: {
          sourceType: 'comment' as const,
          sourceId: comment.id,
          postId: comment.postId,
          authorProfileId: comment.authorProfileId,
        },
      });

      await this.notificationRepository.save(notification);

      await this.notificationEventsProducer.emitMention({
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
      parentId: comment.parentId ?? undefined,
      content: comment.content,
      likesCount: comment.likes?.length,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
