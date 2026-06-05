import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Notification } from '../entities/notification.entity';
import { MentionEventPayload, UserSubscribedEventPayload } from '../kafka/kafka.constants';
import { NotificationDto } from './dto/notification.dto';

const USER_SUBSCRIBED_TYPE = 'user_subscribed';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepository: Repository<Notification>,
  ) {}

  async handleUserSubscribed(payload: UserSubscribedEventPayload): Promise<void> {
    const notification = this.notificationsRepository.create({
      recipientProfileId: payload.followingProfileId,
      type: USER_SUBSCRIBED_TYPE,
      payload: { followerProfileId: payload.followerProfileId },
    });

    await this.notificationsRepository.save(notification);
    this.logger.log(`Saved user_subscribed notification for profile ${payload.followingProfileId}`);
  }

  async handleMention(payload: MentionEventPayload): Promise<void> {
    const notification = this.notificationsRepository.create({
      recipientProfileId: payload.mentionedProfileId,
      type: 'mention',
      payload: {
        sourceType: payload.sourceType,
        sourceId: payload.sourceId,
        authorProfileId: payload.authorProfileId,
      },
    });

    await this.notificationsRepository.save(notification);
    this.logger.log(`Saved mention notification for profile ${payload.mentionedProfileId}`);
  }

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
