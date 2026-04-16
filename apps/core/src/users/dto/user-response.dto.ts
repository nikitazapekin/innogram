import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsUUID } from 'class-validator';

export class UserResponseDto {
  @ApiProperty({
    description: 'User identifier.',
    //поубирать
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID()
  id: string;

  @ApiProperty({
    description: 'User email address.',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User creation timestamp.',
    // createdAt доллжен отображдаться через исо
    example: '2026-04-15T10:00:00.000Z',
    format: 'date-time',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp.',
    example: '2026-04-15T10:30:00.000Z',
    format: 'date-time',
  })
  @IsDate()
  updatedAt: Date;
}
