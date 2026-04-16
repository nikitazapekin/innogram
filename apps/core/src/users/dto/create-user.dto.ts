import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    //лишний
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'strong-password',
    // символы уникальные, maxLength
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password: string;
}
