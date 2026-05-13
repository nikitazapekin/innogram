import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GetAuthUserQueryDto {
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(320)
  email: string;
}
