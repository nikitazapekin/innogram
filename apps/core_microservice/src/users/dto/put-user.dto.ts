import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class PutUserDto {
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'strong-password',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
