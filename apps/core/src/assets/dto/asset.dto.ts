import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString, MaxLength } from 'class-validator';

export class AssetDto {
  @IsNumber()
  @Type(() => Number)
  id: number;

  @IsNumber()
  @Type(() => Number)
  ownerProfileId: number;

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
