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
  ApiTags,
} from '@nestjs/swagger';

import { CommentsService } from './comments.service';
import { CommentDto } from './dto/comment.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiTags('comments')
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: 'Create a comment' })
  @ApiCreatedResponse({
    description: 'Comment has been created successfully.',
    type: CommentDto,
  })
  @ApiBadRequestResponse({ description: 'Request body validation failed.' })
  @Post('/comments/:postId')
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

  @Get('comments/:id')
  @ApiOperation({ summary: 'Get a comment by id' })
  @ApiOkResponse({
    description: 'Comment has been retrieved successfully.',
    type: CommentDto,
  })
  @ApiBadRequestResponse({ description: 'The provided comment id is invalid.' })
  @ApiNotFoundResponse({ description: 'Comment was not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<CommentDto> {
    return this.commentsService.findOne(id);
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
    @Query('postId') _postId?: string,
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
    @Query('postId') _postId?: string,
  ): Promise<CommentDto> {
    return this.commentsService.put(id, updateCommentDto);
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Delete a comment' })
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
