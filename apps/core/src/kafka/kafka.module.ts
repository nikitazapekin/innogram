import { Global, Module } from '@nestjs/common';

import { NotificationEventsProducer } from './notification-events.producer';

@Global()
@Module({
  providers: [NotificationEventsProducer],
  exports: [NotificationEventsProducer],
})
export class KafkaModule {}
