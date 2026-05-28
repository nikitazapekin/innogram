import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  create(recipientProfileId: number, type: string, payload: Record<string, unknown> | null) {
    const notification = this.repo.create({ recipientProfileId, type });

    if (payload) {
      notification.payload = payload;
    }

    return this.repo.save(notification);
  }

  async findByRecipient(profileId: number, page = 1, limit = 20) {
    const [data, total] = await this.repo.findAndCount({
      where: { recipientProfileId: profileId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(notificationId: string, profileId: number) {
    const notification = await this.repo.findOneBy({
      id: notificationId,
      recipientProfileId: profileId,
    });
    if (!notification) throw new NotFoundException('Notification was not found.');
    return notification;
  }

  async markRead(notificationId: string, profileId: number) {
    const notification = await this.findOne(notificationId, profileId);
    notification.readAt = new Date();
    return this.repo.save(notification);
  }

  async markUnread(notificationId: string, profileId: number) {
    const notification = await this.findOne(notificationId, profileId);
    notification.readAt = null;
    return this.repo.save(notification);
  }

  async remove(notificationId: string, profileId: number) {
    const result = await this.repo.delete({ id: notificationId, recipientProfileId: profileId });
    if (!result.affected) throw new NotFoundException('Notification was not found.');
  }
}
