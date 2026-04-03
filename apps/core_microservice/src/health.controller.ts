import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('System')
@Controller('api/health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  @Get()
  @ApiOperation({ summary: 'Check API Gateway status' })
  getHealth() {
   

    return {
      service: 'core_microservice',
      status: 'ok',
      role: 'API_GATEWAY',
    };
  }
}
