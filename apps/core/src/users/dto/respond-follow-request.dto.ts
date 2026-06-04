import { IsEnum } from 'class-validator';

import { FollowRequestStatus } from '../../entities/follow-request.entity';

export class RespondFollowRequestDto {
  @IsEnum(FollowRequestStatus)
  status: FollowRequestStatus.APPROVED | FollowRequestStatus.REJECTED;
}
