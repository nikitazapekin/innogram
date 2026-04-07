import { Controller, Get, Logger } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  logger = new Logger(HealthController.name);

  constructor(private readonly healthService: HealthService) {}

  @Get()
  getHealth() {
    this.logger.log('HTTP health-check received by auth_microservice');
    const serviceStatus = this.healthService.getHealthStatus();

    return {
      service: 'auth_microservice',
      status: 'ok',
      authServiceStatus: serviceStatus,
    };
  }
}
