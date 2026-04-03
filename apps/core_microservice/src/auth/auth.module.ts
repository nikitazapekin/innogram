import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CLIENT_TOKENS, getNatsServers } from '@innogram/shared';

import { AuthController } from './auth.controller';
import { AuthGatewayService } from './auth.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: CLIENT_TOKENS.authClient,
        transport: Transport.NATS,
        options: {
          servers: getNatsServers(),
        },
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthGatewayService],
  exports: [AuthGatewayService],
})
export class AuthModule {}
