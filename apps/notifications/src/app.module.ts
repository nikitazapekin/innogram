import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { KafkaModule } from './kafka/kafka.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      ignoreEnvFile: true,
      isGlobal: true,
    }),
    KafkaModule,
    NotificationsModule,
  ],
})
export class AppModule {}
