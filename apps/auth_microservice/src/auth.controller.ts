import { Controller } from '@nestjs/common';
import { Ctx, MessagePattern, NatsContext, Payload } from '@nestjs/microservices';
import { SUBJECTS, ValidateTokenRequest, ValidateTokenResponse } from '@innogram/shared';

import { AuthService } from './auth.service';

@Controller()
export class AuthMessagesController { //AuthController   + гайт на аудентификаци. и авторизацию 
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(SUBJECTS.validateToken)
  handleValidateToken(
    @Payload() payload: ValidateTokenRequest,
    @Ctx() context: NatsContext,
  ): ValidateTokenResponse {
    const response = this.authService.validateToken(payload);

    return response;
  }
}
