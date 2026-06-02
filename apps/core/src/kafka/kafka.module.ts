import { Module } from '@nestjs/common';

import { NotificationEventsProducer } from './notification-events.producer';

@Module({
  providers: [NotificationEventsProducer],
  exports: [NotificationEventsProducer],
})
export class KafkaModule {}
