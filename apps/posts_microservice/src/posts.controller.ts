import { Controller, Logger } from '@nestjs/common';
import { Ctx, MessagePattern, NatsContext, Payload } from '@nestjs/microservices';
import {
  CreatePostRequest,
  CreatePostResponse,
  FindPostsRequest,
  FindPostsResponse,
 
  normalizeHeaders,
  SUBJECTS,
} from '@innogram/shared';

import { PostsService } from './posts.service';

@Controller()
export class PostsMessagesController {
  private readonly logger = new Logger(PostsMessagesController.name);

  constructor(private readonly postsService: PostsService) {}

  @MessagePattern(SUBJECTS.getPosts)
  handleGetPosts(@Payload() payload: FindPostsRequest, @Ctx() context: NatsContext): FindPostsResponse {

    const response = this.postsService.findAll(payload);
 

    return response;
  }

  @MessagePattern(SUBJECTS.createPost)
  handleCreatePost(@Payload() payload: CreatePostRequest, @Ctx() context: NatsContext): CreatePostResponse {
    const headers = normalizeHeaders(context.getHeaders());

 

    const response = this.postsService.create(payload);

    
    return response;
  }
}
