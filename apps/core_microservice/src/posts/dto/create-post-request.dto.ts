import { ApiProperty } from '@nestjs/swagger';

export class CreatePostRequestDto {
  @ApiProperty({ example: 'First stub post' })
  title: string;

  @ApiProperty({ example: 'Post body for NATS architecture smoke test.' })
  content: string;
}
