import { ApiProperty } from '@nestjs/swagger';

export class UserEntity {
  @ApiProperty({ example: 'user-001' })
  id: string;

  @ApiProperty({ example: 'demo@innogram.local' })
  email: string;

  @ApiProperty({ example: 'Demo User' })
  displayName: string;
}
