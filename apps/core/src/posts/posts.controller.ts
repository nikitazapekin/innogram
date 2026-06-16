import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedRequest } from '@innogram/shared';

import { CreatePostDto } from './dto/create-post.dto';
import { CursorPaginatedPostsDto } from './dto/cursor-paginated-posts.dto';
import { PostDto } from './dto/post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@ApiTags('posts')
@ApiBearerAuth('access-token')
@Controller('posts')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'List posts with cursor pagination' })
  @ApiOkResponse({ description: 'Posts retrieved successfully.', type: CursorPaginatedPostsDto })
  getPosts(@Query() query: QueryPostsDto): Promise<CursorPaginatedPostsDto> {
    return this.postsService.getPostsByQuery(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a post by id' })
  @ApiOkResponse({ description: 'Post retrieved successfully.', type: PostDto })
  @ApiNotFoundResponse({ description: 'Post was not found.' })
  getPost(@Param('id', ParseIntPipe) id: number): Promise<PostDto> {
    return this.postsService.getPost(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a post' })
  @ApiCreatedResponse({ description: 'Post created successfully.', type: PostDto })
  @ApiBadRequestResponse({ description: 'Request body validation failed.' })
  createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<PostDto> {
    return this.postsService.createPost(createPostDto, request.user!.email);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  @ApiOkResponse({ description: 'Post updated successfully.', type: PostDto })
  @ApiNotFoundResponse({ description: 'Post was not found.' })
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostDto> {
    return this.postsService.updatePost(id, updatePostDto);
  }

  @Post(':id/archive')
  @ApiOperation({ summary: 'Archive a post' })
  @ApiOkResponse({ description: 'Post archived successfully.', type: PostDto })
  @ApiNotFoundResponse({ description: 'Post was not found.' })
  archivePost(@Param('id', ParseIntPipe) id: number): Promise<PostDto> {
    return this.postsService.archivePost(id);
  }

  @Post(':id/unarchive')
  @ApiOperation({ summary: 'Unarchive a post' })
  @ApiOkResponse({ description: 'Post unarchived successfully.', type: PostDto })
  @ApiNotFoundResponse({ description: 'Post was not found.' })
  unarchivePost(@Param('id', ParseIntPipe) id: number): Promise<PostDto> {
    return this.postsService.unarchivePost(id);
  }

  @Post(':id/like/:profileId')
  @ApiOperation({ summary: 'Like a post' })
  @ApiNoContentResponse({ description: 'Post liked successfully.' })
  @ApiNotFoundResponse({ description: 'Post was not found.' })
  async like(
    @Param('id', ParseIntPipe) id: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<void> {
    await this.postsService.like(id, profileId);
  }

  @Delete(':id/like/:profileId')
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiNoContentResponse({ description: 'Post unliked successfully.' })
  @ApiNotFoundResponse({ description: 'Post was not found.' })
  async unlike(
    @Param('id', ParseIntPipe) id: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<void> {
    await this.postsService.unlike(id, profileId);
  }

  @Post(':id/dislike/:profileId')
  @ApiOperation({ summary: 'Dislike a post' })
  @ApiNoContentResponse({ description: 'Post disliked successfully.' })
  @ApiNotFoundResponse({ description: 'Post was not found.' })
  async dislike(
    @Param('id', ParseIntPipe) id: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<void> {
    await this.postsService.dislike(id, profileId);
  }

  @Delete(':id/dislike/:profileId')
  @ApiOperation({ summary: 'Remove dislike from a post' })
  @ApiNoContentResponse({ description: 'Post undisliked successfully.' })
  @ApiNotFoundResponse({ description: 'Post was not found.' })
  async undislike(
    @Param('id', ParseIntPipe) id: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<void> {
    await this.postsService.undislike(id, profileId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  @ApiNoContentResponse({ description: 'Post deleted successfully.' })
  @ApiNotFoundResponse({ description: 'Post was not found.' })
  deletePost(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.postsService.deletePost(id);
  }
}
