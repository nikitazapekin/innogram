import { Injectable, Logger } from '@nestjs/common';
import { ValidateTokenRequest, ValidateTokenResponse } from '@innogram/shared';

@Injectable()
export class AuthService {
 

  validateToken(payload: ValidateTokenRequest): ValidateTokenResponse {
   console.log(payload)
    return {
      isValid: true,
      user: {
        id: 'user-001',
        email: 'demo@innogram.local',
        displayName: 'Demo User',
      },
      message: '',
    };
  }
}