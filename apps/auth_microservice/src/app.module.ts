import { Module } from '@nestjs/common';

import { AuthMessagesController } from './auth.controller';
import { AuthService } from './auth.service';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController, AuthMessagesController],
  providers: [AuthService],
})
export class AppModule {}
