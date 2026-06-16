import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from '../entities/notification.entity';
import { NotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async findByRecipient(recipientProfileId: number): Promise<NotificationDto[]> {
    const notifications = await this.notificationsRepository.find({
      where: { recipientProfileId },
      order: { createdAt: 'DESC' },
    });

    return notifications.map((item) => NotificationDto.fromEntity(item));
  }

  async updateReadState(id: string, read: boolean): Promise<NotificationDto> {
    const notification = await this.findNotificationOrThrow(id);

    if (read) {
      notification.readAt = new Date();
    }

    const saved = await this.notificationsRepository.save(notification);

    return NotificationDto.fromEntity(saved);
  }

  async remove(id: string): Promise<void> {
    const result = await this.notificationsRepository.delete({ id });

    if (!result.affected) {
      throw new NotFoundException('Notification was not found.');
    }
  }

  private async findNotificationOrThrow(id: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOneBy({ id });

    if (!notification) {
      throw new NotFoundException('Notification was not found.');
    }

    return notification;
  }
}
