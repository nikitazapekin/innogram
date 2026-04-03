import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ValidateTokenResponse } from '@innogram/shared';

import { AuthGatewayService } from './auth.service';
import { ValidateTokenRequestDto } from './dto/validate-token-request.dto';
import { ValidateTokenResponseDto } from './dto/validate-token-response.dto';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authGatewayService: AuthGatewayService) {}

  @Post('validate')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Authenticate client request through auth_microservice' })
  @ApiBody({ type: ValidateTokenRequestDto })
  @ApiOkResponse({ type: ValidateTokenResponseDto })
  validateToken(
    @Body() body: ValidateTokenRequestDto,
    @Headers('authorization') authorizationHeader?: string,
  ): Promise<ValidateTokenResponse> {
    const accessToken = body.accessToken || extractBearerToken(authorizationHeader);

    return this.authGatewayService.validateToken({ accessToken });
  }
}
function extractBearerToken(authorizationHeader?: string): string {
  if (!authorizationHeader) {
    return 'demo-access-token';
  }

  return '';
}
