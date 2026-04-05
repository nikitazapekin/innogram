import { Body, Controller, Post, Headers } from '@nestjs/common';
import { ValidateTokenResponse } from '@innogram/shared';

import { AuthGatewayService } from './auth.service';
import { ValidateTokenRequestDto } from './dto/validate-token-request.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authGatewayService: AuthGatewayService) {}

  @Post('validate')
  async validateToken(
    @Body() body: ValidateTokenRequestDto,
    @Headers('authorization') authorizationHeader?: string,
  ): Promise<ValidateTokenResponse> {
    const accessToken = body?.accessToken;

    return this.authGatewayService.validateToken({ accessToken });
  }
}
