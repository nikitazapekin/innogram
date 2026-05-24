import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class CommentDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNumber()
  postId: number;

  @IsNumber()
  @Type(() => Number)
  authorProfileId: number;

  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  likesCount?: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedAt?: Date;
}
