import { Module } from '@nestjs/common';

import { HealthController } from './health.controller';
import { PostsMessagesController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  controllers: [HealthController, PostsMessagesController],
  providers: [PostsService],
})
export class AppModule {}
