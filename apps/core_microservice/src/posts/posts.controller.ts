import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePostResponse, FindPostsResponse } from '@innogram/shared';

import { CreatePostRequestDto } from './dto/create-post-request.dto';
import { PostsGatewayService } from './posts.service';

@ApiBearerAuth()
@Controller('api/posts')
export class PostsController {
  constructor(private readonly postsGatewayService: PostsGatewayService) {}

  @Get()
  findAll(@Headers('authorization') authorizationHeader?: string): Promise<FindPostsResponse> {
    return this.postsGatewayService.findAll({
      accessToken: extractBearerToken(authorizationHeader),
    });
  }

  @Post()
  create(
    @Body() body: CreatePostRequestDto,
    @Headers('authorization') authorizationHeader?: string,
  ): Promise<CreatePostResponse> {
    return this.postsGatewayService.create({
      accessToken: extractBearerToken(authorizationHeader),
      title: body.title,
      content: body.content,
    });
  }
}

function extractBearerToken(authorizationHeader?: string): string {
  if (!authorizationHeader) {
    return 'demo-access-token';
  }

  return '';
}
