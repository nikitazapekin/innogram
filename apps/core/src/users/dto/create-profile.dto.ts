import { Type } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

export class CreateProfileDto {
  @IsNumber()
  @Type(() => Number)
  userId: number;

  @IsString()
  displayName: string;
}
