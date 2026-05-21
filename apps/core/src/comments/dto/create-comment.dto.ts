import { IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommentDto {
  @IsNumber()
  @Type(() => Number)
  authorProfileId: number;

  @IsString()
  content: string;
}
