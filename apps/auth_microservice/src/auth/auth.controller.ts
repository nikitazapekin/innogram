import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, NatsContext, Payload } from '@nestjs/microservices';
import { SUBJECTS, ValidateTokenRequest, ValidateTokenResponse } from '@innogram/shared';

import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(SUBJECTS.validateToken)
  async handleValidateToken(
    @Payload() payload: ValidateTokenRequest,
    @Ctx() context: NatsContext,
  ): Promise<ValidateTokenResponse> {
    const response = await this.authService.validateToken(payload);

    if ('user' in response) {
      return {
        user: response.user,
        message: 'Token validation completed successfully.',
      } as ValidateTokenResponse;
    }

    return response;
  }
}
