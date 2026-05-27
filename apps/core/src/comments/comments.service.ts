import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';

import { Comment } from '../entities/comment.entity';
import { CommentDto } from './dto/comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async create(postId: number, commentDto: CreateCommentDto): Promise<CommentDto> {
    if (commentDto.parentId) {
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

    const dto = this.toCommentDto(comment);
    dto.replies = await this.findReplies(id);

    return dto;
  }

  async findByPost(postId: number): Promise<CommentDto[]> {
    const comments = await this.commentsRepository.find({
      where: { postId, parentId: IsNull() },
      order: { createdAt: 'DESC' },
      relations: ['likes'],
    });

    const result: CommentDto[] = [];

    for (const comment of comments) {
      const dto = this.toCommentDto(comment);
      dto.replies = await this.findReplies(comment.id);
      result.push(dto);
    }

    return result;
  }

  async findReplies(commentId: number): Promise<CommentDto[]> {
    const replies = await this.commentsRepository.find({
      where: { parentId: commentId },
      order: { createdAt: 'ASC' },
      relations: ['likes'],
    });

    const result: CommentDto[] = [];

    for (const reply of replies) {
      const dto = this.toCommentDto(reply);
      dto.replies = await this.findReplies(reply.id);
      result.push(dto);
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
    const comment = await this.findCommentById(id);
    await this.commentsRepository.delete({ parentId: id });
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
      parentId: comment.parentId,
      content: comment.content,
      likesCount: comment.likes?.length,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
