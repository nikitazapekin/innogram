import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class FollowRequestDto {
  @IsNumber()
  id: number;

  @IsNumber()
  followerProfileId: number;

  @IsNumber()
  followingProfileId: number;

  @IsString()
  status: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedAt?: Date;
}
