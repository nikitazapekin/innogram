import { Module } from '@nestjs/common';
import { CLIENT_TOKENS } from '@innogram/shared';

import { createNatsClientModule } from '../common/create-nats-client.module';
import { AuthController } from './auth.controller';
import { AuthGatewayService } from './auth.service';

@Module({
  imports: [createNatsClientModule(CLIENT_TOKENS.authClient)],
  controllers: [AuthController],
  providers: [AuthGatewayService],
  exports: [AuthGatewayService],
})
export class AuthModule {}
