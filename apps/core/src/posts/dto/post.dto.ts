import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class MediaDto {
  @IsNumber()
  id: number;

  @IsString()
  type: 'image' | 'video';

  @IsString()
  url: string;
}

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

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  dislikesCount?: number;

  @Type(() => Boolean)
  isArchived: boolean;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  archivedAt: Date | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaDto)
  media?: MediaDto[];
}
