import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { CreatePostRequestDto } from './dto/create-post-request.dto';
import { CreatePostResponseDto } from './dto/create-post-response.dto';
import { FindPostsResponseDto } from './dto/find-posts-response.dto';
import { PostsGatewayService } from './posts.service';

@ApiTags('Posts')
@ApiBearerAuth()
@Controller('api/posts')
export class PostsController {
  constructor(private readonly postsGatewayService: PostsGatewayService) {}

  @Get()
  @ApiOperation({
    summary: 'Validate request in auth_microservice and fetch posts from posts_microservice',
  })
  @ApiOkResponse({ type: FindPostsResponseDto })
  findAll(@Headers('authorization') authorizationHeader?: string): Promise<FindPostsResponseDto> {
    return this.postsGatewayService.findAll({
      accessToken: extractBearerToken(authorizationHeader),
    });
  }

  @Post()
  @ApiOperation({
    summary: 'Validate request in auth_microservice and create a post through posts_microservice',
  })
  @ApiBody({ type: CreatePostRequestDto })
  @ApiOkResponse({ type: CreatePostResponseDto })
  create(
    @Body() body: CreatePostRequestDto,
    @Headers('authorization') authorizationHeader?: string,
  ): Promise<CreatePostResponseDto> {
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
