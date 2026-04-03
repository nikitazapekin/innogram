import { ApiProperty } from '@nestjs/swagger';

import { UserEntity } from '../../common/entities/user.entity';

export class ValidateTokenResponseDto {
  @ApiProperty({ example: true })
  isValid: boolean;

  @ApiProperty({ type: () => UserEntity })
  user: UserEntity;

  @ApiProperty({ example: 'Stub auth validation completed through NATS.' })
  message: string;
}
