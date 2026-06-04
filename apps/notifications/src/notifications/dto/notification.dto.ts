import { Notification } from '../../entities/notification.entity';

export class NotificationDto {
  id: string;
  recipientProfileId: number;
  type: string;
  payload: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  readAt: Date | null;
  isRead: boolean;

  static fromEntity(entity: Notification): NotificationDto {
    return {
      id: entity.id,
      recipientProfileId: entity.recipientProfileId,
      type: entity.type,
      payload: entity.payload,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      readAt: entity.readAt,
      isRead: entity.readAt !== null,
    };
  }
}
