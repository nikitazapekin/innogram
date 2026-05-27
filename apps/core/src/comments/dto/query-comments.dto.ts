import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class QueryCommentsDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  postId?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parentId?: number;
}
