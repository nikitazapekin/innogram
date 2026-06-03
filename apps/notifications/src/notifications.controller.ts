import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from './entities/notification.entity';

@Controller()
export class NotificationsController {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  @Get(':profileId')
  async getNotifications(
    @Param('profileId', ParseIntPipe) profileId: number,
  ): Promise<Notification[]> {
    return this.notificationRepository.find({
      where: { recipientProfileId: String(profileId) },
      order: { createdAt: 'DESC' },
    });
  }
}
