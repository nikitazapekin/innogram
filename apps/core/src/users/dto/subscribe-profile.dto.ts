import { IsInt, Min } from 'class-validator';

export class SubscribeProfileDto {
  @IsInt()
  @Min(1)
  followerProfileId: number;
}
