import { Module } from '@nestjs/common';
import { CLIENT_TOKENS } from '@innogram/shared';

import { AuthModule } from '../auth/auth.module';
import { createNatsClientModule } from '../common/create-nats-client.module';
import { PostsController } from './posts.controller';
import { PostsGatewayService } from './posts.service';

@Module({
  imports: [
    AuthModule,
    createNatsClientModule(CLIENT_TOKENS.postsClient),
  ],
  controllers: [PostsController],
  providers: [PostsGatewayService],
})
export class PostsModule {}
