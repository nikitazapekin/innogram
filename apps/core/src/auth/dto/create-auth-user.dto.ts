import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAuthUserDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(320)
  email: string;

  @IsString()
  @IsIn(['local', 'google'])
  provider: 'local' | 'google';

  @IsOptional()
  @IsString()
  @MaxLength(255)
  googleId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  passwordHash?: string | null;
}
