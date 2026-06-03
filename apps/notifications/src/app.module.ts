import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationsDatabaseConfigService } from './database.config';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      ignoreEnvFile: true,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: NotificationsDatabaseConfigService,
    }),
    NotificationsModule,
  ],
})
export class AppModule {}
