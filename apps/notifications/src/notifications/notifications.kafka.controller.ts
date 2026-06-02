import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

import { USER_SUBSCRIBED_EVENT, UserSubscribedEventPayload } from '../kafka/kafka.constants';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsKafkaController {
  private readonly logger = new Logger(NotificationsKafkaController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern(USER_SUBSCRIBED_EVENT)
  async handleUserSubscribed(@Payload() payload: UserSubscribedEventPayload): Promise<void> {
    this.logger.log(`Received ${USER_SUBSCRIBED_EVENT} event`);
    await this.notificationsService.handleUserSubscribed(payload);
  }
}
