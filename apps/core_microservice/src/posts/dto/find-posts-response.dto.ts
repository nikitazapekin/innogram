import { ApiProperty } from '@nestjs/swagger';

import { PostEntity } from '../../common/entities/post.entity';
import { UserEntity } from '../../common/entities/user.entity';

export class FindPostsResponseDto {
  @ApiProperty({ type: () => [PostEntity] })
  items: PostEntity[];

  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ type: () => UserEntity })
  authorizedUser: UserEntity;

  @ApiProperty({ example: 'Stub posts list returned by posts_microservice.' })
  message: string;
}
