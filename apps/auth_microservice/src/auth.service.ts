import { Injectable, Logger } from '@nestjs/common';
import { ServiceResponse, ValidateTokenRequest, ValidateTokenResponse } from '@innogram/shared';

export interface User {  // вынести
  id: string;
  email: string;
  displayName: string;
}

@Injectable()
export class AuthService {
  logger = new Logger(AuthService.name);

  validateToken(payload: ValidateTokenRequest): ValidateTokenResponse { // Промисы с validateToken 
    try {
      if (!payload?.accessToken?.trim()) {  //убрать
        throw new Error('Access token is required');
      }

      const user: User = {
        id: 'user-001',
        email: 'demo@innogram.local',
        displayName: 'Demo User',
      };

      return {
        isValid: true, //убрать
        user,  //только его возвращаем
        message: 'Token validation completed successfully.',  //убрать
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown validation error';  //обычный if else

      this.logger.error(`validateToken failed: ${message}`);

      return {
        error: true,  //убрать
        message, 
      };
    }
  }

  getHealthStatus(): ServiceResponse<{ isReady: boolean; timestamp: string }> {  // создать новый сервис  + в параметрах можно добавить юзера
   //переименовать ServiceResponce  + убрать таймстепт,  age юзера  и т д
   
    try {
      return {   // добавить логику 
        isReady: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown health check error';  // if else

      this.logger.error(`getHealthStatus failed: ${message}`);

      return {
        error: true,   // убрать
        message,
      };
    }
  }
}


// аудентификация на нест джс ютуб  или потом через гпт посмтореть для аудентификации

//dbeaver - скачать
