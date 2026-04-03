import { Module } from '@nestjs/common';

import { AuthModule } from './auth/auth.module';
import { HealthController } from './health.controller';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [AuthModule, PostsModule],
  controllers: [HealthController],
})
export class AppModule {}
