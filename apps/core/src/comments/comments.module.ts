import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Comment } from '../entities/comment.entity';
import { Notification } from '../entities/notification.entity';
import { KafkaModule } from '../kafka/kafka.module';
import { MentionsModule } from '../mentions/mentions.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Notification]), MentionsModule, KafkaModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
