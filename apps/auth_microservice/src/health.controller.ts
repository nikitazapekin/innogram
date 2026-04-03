import { Controller, Get, Logger } from '@nestjs/common';
import { AuthService } from './auth.service'; 

@Controller('health')
export class HealthController {
   logger = new Logger(HealthController.name);

     constructor(private readonly authService: AuthService) {}

  @Get()
  getHealth() {
    this.logger.log('HTTP health-check received by auth_microservice');
 const serviceStatus = this.authService.getHealthStatus();
    return {
      service: 'auth_microservice',
      status: 'ok',
      authServiceStatus: serviceStatus, 
    };
  }
}
