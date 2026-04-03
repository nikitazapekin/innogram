import { Injectable, Logger } from '@nestjs/common';
import {
  CreatePostRequest,
  CreatePostResponse,
  FindPostsRequest,
  FindPostsResponse,
} from '@innogram/shared';
import { randomUUID } from 'node:crypto';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  findAll(payload: FindPostsRequest): FindPostsResponse {
    this.logger.log(`Stub findAll called for userId="${payload.userId}". Replace this with DB read logic later.`);

    return {
      items: [
        {
          id: 'post-001',
          title: 'Stub post from posts_microservice',
          content: 'This payload proves that NATS routing between services works.',
          authorId: payload.userId,
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
      authorizedUser: {
        id: payload.userId,
        email: 'demo@innogram.local',
        displayName: 'Demo User',
      },
      message: 'Stub posts list returned by posts_microservice.',
    };
  }

  create(payload: CreatePostRequest): CreatePostResponse {
    this.logger.log(
      `Stub create called for authorId="${payload.authorId}" and title="${payload.title}". Replace this with DB write logic later.`,
    );

    return {
      post: {
        id: randomUUID(),
        title: payload.title,
        content: payload.content,
        authorId: payload.authorId,
        createdAt: new Date().toISOString(),
      },
      authorizedUser: {
        id: payload.authorId,
        email: 'demo@innogram.local',
        displayName: 'Demo User',
      },
      message: 'Stub post creation routed through posts_microservice.',
    };
  }
}
