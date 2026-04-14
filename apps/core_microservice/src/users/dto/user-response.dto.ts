import { ApiProperty } from '@nestjs/swagger';

import { User } from '../../entities/user.entity';

export class UserResponseDto {
  id: string;

  email: string;

  createdAt: Date;

  updatedAt: Date;

  static fromEntity(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
