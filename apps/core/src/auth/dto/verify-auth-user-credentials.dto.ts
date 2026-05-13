import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class VerifyAuthUserCredentialsDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(320)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(4096)
  password: string;
}
