import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  displayName?: string;

  @IsOptional()
  @IsString()
  bio?: string | null;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  avatarAssetId?: number | null;
}
