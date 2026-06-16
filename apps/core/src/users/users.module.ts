import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FollowRequest } from '../entities/follow-request.entity';
import { Notification } from '../entities/notification.entity';
import { Post } from '../entities/post.entity';
import { Profile } from '../entities/profile.entity';
import { UserEntity } from '../entities/user.entity';
import { KafkaModule } from '../kafka/kafka.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile, FollowRequest, Post, UserEntity, Notification]),
    KafkaModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
