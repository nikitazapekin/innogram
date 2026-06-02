import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsDatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configService.getOrThrow('NOTIFICATIONS_POSTGRES_HOST'),
      port: Number(this.configService.getOrThrow('NOTIFICATIONS_POSTGRES_PORT')),
      username: this.configService.getOrThrow('NOTIFICATIONS_POSTGRES_USER'),
      password: this.configService.getOrThrow('NOTIFICATIONS_POSTGRES_PASSWORD'),
      database: this.configService.getOrThrow('NOTIFICATIONS_POSTGRES_DATABASE'),
      entities: [Notification],
      synchronize: false,
    };
  }
}
