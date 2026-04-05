import { Module } from '@nestjs/common';

import { HealthController } from './health/health.controller';
import { PostsMessagesController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';

@Module({
  controllers: [HealthController, PostsMessagesController],
  providers: [PostsService],
})
export class AppModule {}
