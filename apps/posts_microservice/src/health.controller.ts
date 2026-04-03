import { Controller, Get, Logger } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      service: 'posts_microservice',
      status: 'ok',
    };
  }
}
