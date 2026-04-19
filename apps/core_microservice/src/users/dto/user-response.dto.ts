import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsNumber } from 'class-validator';

import { User } from '../../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({
    description: 'User identifier.',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    description: 'User email address.',
    example: 'user@example.com',
  })
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

  constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  static fromEntity(user: User): UserResponseDto {
    return new UserResponseDto(user);
  }
}
