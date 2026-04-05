import { Module } from '@nestjs/common';

import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { HealthController } from './health/health.controller';
import { HealthService } from './health/health.service';

@Module({
  controllers: [HealthController, AuthController],
  providers: [AuthService, HealthService], //AuthMessagesService и хелз
})
export class AppModule {}
