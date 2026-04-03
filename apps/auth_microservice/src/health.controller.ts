import { Controller, Get, Logger } from '@nestjs/common';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  @Get()
  getHealth() {
    this.logger.log('HTTP health-check received by auth_microservice');

    return {
      service: 'auth_microservice',
      status: 'ok',
    };
  }
}
