import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  buildNatsRecord,
  CLIENT_TOKENS,
  CreatePostRequest,
  CreatePostResponse,
  FindPostsRequest,
  FindPostsResponse,
  SUBJECTS,
} from '@innogram/shared';
import { randomUUID } from 'node:crypto';
import { firstValueFrom, timeout } from 'rxjs';

import { AuthGatewayService } from '../auth/auth.service';

interface AuthorizedRequest {
  accessToken: string;
}

interface CreatePostGatewayRequest extends AuthorizedRequest {
  title: string;
  content: string;
}

@Injectable()
export class PostsGatewayService implements OnModuleInit {
  private readonly logger = new Logger(PostsGatewayService.name);

  constructor(
    private readonly authGatewayService: AuthGatewayService,
    @Inject(CLIENT_TOKENS.postsClient) private readonly client: ClientProxy,
  ) {}

  async onModuleInit() {
    await this.client.connect();
  }

  async findAll(request: AuthorizedRequest): Promise<FindPostsResponse> {
    const authResult = await this.authGatewayService.validateToken({
      accessToken: request.accessToken,
    });

    const requestId = randomUUID();
    const payload: FindPostsRequest = {
      userId: authResult.user.id,
    };
    const headers = {
      'x-request-id': requestId,
      'x-origin': 'core-microservice',
      'x-auth-user-id': authResult.user.id,
      'x-parent-subject': SUBJECTS.validateToken,
    };

    const response = await firstValueFrom<FindPostsResponse>(
      this.client.send(SUBJECTS.getPosts, buildNatsRecord(payload, headers)).pipe(timeout(5000)),
    );

    return response;
  }

  async create(request: CreatePostGatewayRequest): Promise<CreatePostResponse> {
    const authResult = await this.authGatewayService.validateToken({
      accessToken: request.accessToken,
    });

    const requestId = randomUUID();
    const payload: CreatePostRequest = {
      authorId: authResult.user.id,
      title: request.title,
      content: request.content,
    };
    const headers = {
      'x-request-id': requestId,
      'x-origin': 'core-microservice',
      'x-auth-user-id': authResult.user.id,
      'x-parent-subject': SUBJECTS.validateToken,
    };

    const response = await firstValueFrom<CreatePostResponse>(
      this.client.send(SUBJECTS.createPost, buildNatsRecord(payload, headers)).pipe(timeout(5000)),
    );

    return response;
  }
}
