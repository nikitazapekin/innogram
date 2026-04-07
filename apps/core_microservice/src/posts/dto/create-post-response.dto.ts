import { ApiProperty } from '@nestjs/swagger';

import { PostEntity } from '../../common/entities/post.entity';
import { UserEntity } from '../../common/entities/user.entity';

export class CreatePostResponseDto {
  @ApiProperty({ type: () => PostEntity })
  post: PostEntity;

  @ApiProperty({ type: () => UserEntity })
  authorizedUser: UserEntity;

  @ApiProperty({ example: 'Stub post creation routed through posts_microservice.' })
  message: string;
}
