import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsUUID } from 'class-validator';

export class UserResponseDto {
  @ApiProperty({
    format: 'uuid',
  })
  @IsUUID()
  id: string;

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
