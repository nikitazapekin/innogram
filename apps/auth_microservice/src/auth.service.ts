import { Injectable, Logger } from '@nestjs/common';
import { ServiceResponse, ValidateTokenRequest, ValidateTokenResponse } from '@innogram/shared';

export interface User {
  id: string;
  email: string;
  displayName: string;
}

@Injectable()
export class AuthService {
 logger = new Logger(AuthService.name);

  validateToken(payload: ValidateTokenRequest): ValidateTokenResponse {
    try {
      if (!payload?.accessToken?.trim()) {
        throw new Error('Access token is required');
      }

      const user: User = {
        id: 'user-001',
        email: 'demo@innogram.local',
        displayName: 'Demo User',
      };

      return {
        isValid: true,
        user,
        message: 'Token validation completed successfully.',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown validation error';

      this.logger.error(`validateToken failed: ${message}`);

      return {
        error: true,
        message,
      };
    }
  }

  getHealthStatus(): ServiceResponse<{ isReady: boolean; timestamp: string }> {
    try {
      return {
        isReady: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown health check error';

      this.logger.error(`getHealthStatus failed: ${message}`);

      return {
        error: true,
        message,
      };
    }
  }
}
