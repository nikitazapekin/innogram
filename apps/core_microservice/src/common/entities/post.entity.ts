import { ApiProperty } from '@nestjs/swagger';

export class PostEntity {
  @ApiProperty({ example: 'post-001' })
  id: string;

  @ApiProperty({ example: 'Architecture draft' })
  title: string;

  @ApiProperty({ example: 'This is a stub post returned by posts_microservice.' })
  content: string;

  @ApiProperty({ example: 'user-001' })
  authorId: string;

  @ApiProperty({ example: '2026-04-03T12:00:00.000Z' })
  createdAt: string;
}
