import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CommentDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsNumber()
  postId: number;

  @IsNumber()
  @Type(() => Number)
  authorProfileId: number;

  @IsOptional()
  @IsNumber()
  parentId?: number | null;

  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  likesCount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommentDto)
  replies?: CommentDto[];

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedAt?: Date;
}
