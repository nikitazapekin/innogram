import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class AssetDto {
  @IsNumber()
  @Type(() => Number)
  id: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  ownerProfileId?: number | null;

  @IsString()
  @MaxLength(255)
  fileName: string;

  @IsString()
  @MaxLength(255)
  mimeType: string;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}
