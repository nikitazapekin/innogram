import { Injectable, Logger } from '@nestjs/common';
import { ServiceResponse, ValidateTokenRequest, ValidateTokenResponse } from '@innogram/shared';
 
@Injectable()
export class HealthService {
  

  getHealthStatus(): ServiceResponse<{ isReady: boolean; timestamp: string }> {  // создать новый сервис  + в параметрах можно добавить юзера
   //переименовать ServiceResponce  + убрать таймстепт,  age юзера  и т д
   
    try {
      return {   // добавить логику 
        isReady: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      if( error instanceof Error ) {

        return  {message:  error.message  }
      }
      
      return {message: 'Unknown health check error'};  
 
      
    }
  }
}
 