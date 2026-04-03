import { Controller, Get, Logger } from '@nestjs/common';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  @Get()
  getHealth() {
    return {
      service: 'posts_microservice',
      status: 'ok',
    };
  }
}
