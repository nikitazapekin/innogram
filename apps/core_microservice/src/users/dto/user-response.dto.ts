import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsInt } from 'class-validator';

export class UserResponseDto {
  @ApiProperty({
    example: 1,
    type: Number,
  })
  @IsInt()
  id: number;

  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User creation timestamp.',
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
