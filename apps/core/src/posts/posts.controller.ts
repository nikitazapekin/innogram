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
import { PaginatedPostsDto } from './dto/paginated-posts.dto';
import { PostDto } from './dto/post.dto';
import { QueryPostsDto } from './dto/query-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';

@Controller('posts')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts(@Query() query: QueryPostsDto): Promise<PaginatedPostsDto | PostDto[]> {
    if (Object.keys(query).length === 0) {
      return this.postsService.getPosts();
    }

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

  @Delete(':id')
  deletePost(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.postsService.deletePost(id);
  }
}
