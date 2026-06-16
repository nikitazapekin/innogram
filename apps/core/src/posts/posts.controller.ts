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
import type { AuthenticatedRequest } from '@innogram/shared';

import { CreatePostDto } from './dto/create-post.dto';
import { CursorPaginatedPostsDto } from './dto/cursor-paginated-posts.dto';
import { PostDto } from './dto/post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts(@Query() query: QueryPostsDto): Promise<CursorPaginatedPostsDto> {
    return this.postsService.getPostsByQuery(query);
  }

  @Get(':id')
  getPost(@Param('id', ParseIntPipe) id: number): Promise<PostDto> {
    return this.postsService.getPost(id);
  }

  @Post()
  createPost(
    @Body() createPostDto: CreatePostDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<PostDto> {
    return this.postsService.createPost(createPostDto, request.user!.email);
  }

  @Patch(':id')
  updatePost(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<PostDto> {
    return this.postsService.updatePost(id, updatePostDto);
  }

  @Post(':id/archive')
  archivePost(@Param('id', ParseIntPipe) id: number): Promise<PostDto> {
    return this.postsService.archivePost(id);
  }

  @Post(':id/unarchive')
  unarchivePost(@Param('id', ParseIntPipe) id: number): Promise<PostDto> {
    return this.postsService.unarchivePost(id);
  }

  @Post(':id/like/:profileId')
  async like(
    @Param('id', ParseIntPipe) id: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<void> {
    await this.postsService.like(id, profileId);
  }

  @Delete(':id/like/:profileId')
  async unlike(
    @Param('id', ParseIntPipe) id: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<void> {
    await this.postsService.unlike(id, profileId);
  }

  @Post(':id/dislike/:profileId')
  async dislike(
    @Param('id', ParseIntPipe) id: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<void> {
    await this.postsService.dislike(id, profileId);
  }

  @Delete(':id/dislike/:profileId')
  async undislike(
    @Param('id', ParseIntPipe) id: number,
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<void> {
    await this.postsService.undislike(id, profileId);
  }

  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.postsService.deletePost(id);
  }
}
