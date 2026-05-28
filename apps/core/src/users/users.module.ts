import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FollowRequest } from '../entities/follow-request.entity';
import { Profile } from '../entities/profile.entity';
import { KafkaModule } from '../kafka/kafka.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, FollowRequest]), KafkaModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
