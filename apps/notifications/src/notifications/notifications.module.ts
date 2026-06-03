import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Notification } from '../entities/notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsKafkaController } from './notifications.kafka.controller';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Notification])],
  controllers: [NotificationsController, NotificationsKafkaController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
