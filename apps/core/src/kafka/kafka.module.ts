import { Global, Module } from '@nestjs/common';

import { KafkaService } from './kafka.service';
import { NotificationEventsProducer } from './notification-events.producer';

@Global()
@Module({
  providers: [KafkaService, NotificationEventsProducer],
  exports: [KafkaService, NotificationEventsProducer],
})
export class KafkaModule {}
