import {  IsString,  } from 'class-validator';
export class ValidateTokenRequestDto {
  @IsString()
  accessToken: string;
}
