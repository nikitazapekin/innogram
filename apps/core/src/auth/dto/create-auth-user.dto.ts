import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateAuthUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(320)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  passwordHash: string;
}
