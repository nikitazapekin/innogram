import { Injectable, Logger } from '@nestjs/common';
import { ServiceResponse, ValidateTokenRequest } from '@innogram/shared';
import { User } from './types/user';

type ValidateTokenServiceResponse = ServiceResponse<{ user: User }>;

@Injectable()
export class AuthService {
  logger = new Logger(AuthService.name);

  async validateToken(payload: ValidateTokenRequest): Promise<ValidateTokenServiceResponse> {
    try {
      const user: User = {
        id: 'user-001',
        email: 'demo@innogram.local',
        displayName: 'Demo User',
      };

      return { user };
    } catch (error) {
      if (error instanceof Error) {
        return { message: error.message };
      }

      return { message: 'Unknown health check error' };
    }
  }
}
