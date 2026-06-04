import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class PostDto {
  @IsNumber()
  @Type(() => Number)
  id: number;

  @IsNumber()
  @Type(() => Number)
  authorProfileId: number;

  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  likesCount?: number;

  @Type(() => Boolean)
  isArchived: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  archivedAt: Date | null;
}
