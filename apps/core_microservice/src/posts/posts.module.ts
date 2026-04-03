import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CLIENT_TOKENS, getNatsServers } from '@innogram/shared';

import { AuthModule } from '../auth/auth.module';
import { PostsController } from './posts.controller';
import { PostsGatewayService } from './posts.service';

@Module({
  imports: [
    AuthModule,
    ClientsModule.register([
      {
        name: CLIENT_TOKENS.postsClient,
        transport: Transport.NATS,
        options: {
          servers: getNatsServers(),
        },
      },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsGatewayService],
})
export class PostsModule {}
