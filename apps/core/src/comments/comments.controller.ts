import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

import { CommentsService } from './comments.service';
import { CommentDto } from './dto/comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { QueryCommentsDto } from './dto/query-comments.dto';

@ApiTags('comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('/comments/:postId')
  @ApiOperation({
    summary: 'Create a comment (top-level or reply)',
    description:
      'Create a new comment on a post. Omit `parentId` for a top-level comment, or set it to reply to an existing comment.',
  })
  @ApiCreatedResponse({
    description: 'Comment has been created successfully.',
    type: CommentDto,
  })
  @ApiBadRequestResponse({ description: 'Request body validation failed.' })
  @ApiNotFoundResponse({ description: 'Specified parent comment was not found.' })
  create(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() commentDto: CreateCommentDto,
  ): Promise<CommentDto> {
    return this.commentsService.create(postId, commentDto);
  }

  @Get('comments')
  @ApiOperation({ summary: 'Get all comments' })
  @ApiOkResponse({
    description: 'Comments have been retrieved successfully.',
    type: CommentDto,
  })
  findAll(): Promise<CommentDto[]> {
    return this.commentsService.findAll();
  }

  @Get('posts/:postId/comments')
  @ApiOperation({
    summary: 'Get top-level comments for a post with nested replies',
    description:
      'Returns all root comments for the given post. Each comment includes its nested `replies` (recursively).',
  })
  @ApiOkResponse({
    description: 'Comments retrieved successfully.',
    type: CommentDto,
  })
  @ApiNotFoundResponse({ description: 'Post was not found.' })
  findByPost(@Param('postId', ParseIntPipe) postId: number): Promise<CommentDto[]> {
    return this.commentsService.findByPost(postId);
  }

  @Get('comments/:id')
  @ApiOperation({ summary: 'Get a comment by id (includes nested replies)' })
  @ApiOkResponse({
    description: 'Comment has been retrieved successfully.',
    type: CommentDto,
  })
  @ApiBadRequestResponse({ description: 'The provided comment id is invalid.' })
  @ApiNotFoundResponse({ description: 'Comment was not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CommentDto> {
    return this.commentsService.findOne(id);
  }

  @Get('comments/:id/replies')
  @ApiOperation({
    summary: 'Get nested replies for a comment',
    description:
      'Returns all direct replies to the specified comment. Each reply includes its own nested `replies` recursively.',
  })
  @ApiOkResponse({
    description: 'Replies retrieved successfully.',
    type: CommentDto,
  })
  @ApiNotFoundResponse({ description: 'Comment was not found.' })
  findReplies(@Param('id', ParseIntPipe) id: number): Promise<CommentDto[]> {
    return this.commentsService.findReplies(id);
  }

  @Patch('comments/:id')
  @ApiOperation({ summary: 'Update a comment' })
  @ApiOkResponse({
    description: 'Comment has been updated successfully.',
    type: CommentDto,
  })
  @ApiBadRequestResponse({ description: 'The provided comment id or request body is invalid.' })
  @ApiNotFoundResponse({ description: 'Comment was not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<CommentDto> {
    return this.commentsService.update(id, updateCommentDto);
  }

  @Put('comments/:id')
  @ApiOperation({ summary: 'Fully update a comment' })
  @ApiOkResponse({
    description: 'Comment has been updated successfully.',
    type: CommentDto,
  })
  @ApiBadRequestResponse({ description: 'The provided comment id or request body is invalid.' })
  @ApiNotFoundResponse({ description: 'Comment was not found.' })
  put(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<CommentDto> {
    return this.commentsService.put(id, updateCommentDto);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Delete a comment and its replies' })
  @ApiBadRequestResponse({ description: 'The provided comment id is invalid.' })
  @ApiNotFoundResponse({ description: 'Comment was not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.commentsService.remove(id);
  }

  @Post('comments/:id/like/:profileId')
  @ApiOperation({ summary: 'Like a comment' })
  @ApiNoContentResponse({ description: 'Comment liked successfully.' })
  @ApiBadRequestResponse({ description: 'The provided comment id or profile id is invalid.' })
  @ApiNotFoundResponse({ description: 'Comment was not found.' })
  async like(
    @Param('id', ParseIntPipe) id: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<void> {
    await this.commentsService.like(id, profileId);
  }

  @Delete('comments/:id/like/:profileId')
  @ApiOperation({ summary: 'Unlike a comment' })
  @ApiNoContentResponse({ description: 'Comment unliked successfully.' })
  @ApiBadRequestResponse({ description: 'The provided comment id or profile id is invalid.' })
  @ApiNotFoundResponse({ description: 'Comment was not found.' })
  async unlike(
    @Param('id', ParseIntPipe) id: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<void> {
    await this.commentsService.unlike(id, profileId);
  }
}
