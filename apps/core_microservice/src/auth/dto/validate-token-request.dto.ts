import { ApiProperty } from '@nestjs/swagger';

export class ValidateTokenRequestDto {
  @ApiProperty({
    example: 'demo-access-token',
    description: 'Bearer token to be sent to auth_microservice',
  })
  accessToken: string;
}
