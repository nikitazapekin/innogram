import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Post } from '../entities/post.entity';
import { UserEntity } from '../entities/user.entity';
import { ArchivedPost } from '../entities/archived-post.entity';
import { Notification } from '../entities/notification.entity';
import { KafkaModule } from '../kafka/kafka.module';
import { MentionsModule } from '../mentions/mentions.module';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, UserEntity, ArchivedPost, Notification]),
    MentionsModule,
    KafkaModule,
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
