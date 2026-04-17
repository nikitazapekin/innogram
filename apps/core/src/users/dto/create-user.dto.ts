import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @ApiProperty({
    maxLength: 20,
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;
}
