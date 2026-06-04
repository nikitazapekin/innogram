import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { readRequiredEnv } from '../common/read-required-env';
import {
  MENTION_EVENT,
  MentionEventPayload,
  USER_SUBSCRIBED_EVENT,
  UserSubscribedEventPayload,
} from './kafka.constants';

const readKafkaBrokers = (): string[] =>
  readRequiredEnv('KAFKA_BROKERS')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);

@Injectable()
export class NotificationEventsProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationEventsProducer.name);
  private client: ClientProxy | null = null;

  async onModuleInit(): Promise<void> {
    this.client = ClientProxyFactory.create({
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: readKafkaBrokers(),
          clientId: 'core-microservice',
        },
        producerOnlyMode: true,
      },
    });

    await this.client.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.close();
  }

  async emitUserSubscribed(payload: UserSubscribedEventPayload): Promise<void> {
    if (!this.client) {
      throw new Error('Kafka producer is not initialized.');
    }

    await firstValueFrom(this.client.emit(USER_SUBSCRIBED_EVENT, payload));
    this.logger.log(`Emitted ${USER_SUBSCRIBED_EVENT}`);
  }

  async emitMention(payload: MentionEventPayload): Promise<void> {
    if (!this.client) {
      return;
    }

    await firstValueFrom(this.client.emit(MENTION_EVENT, payload));
    this.logger.log(`Emitted ${MENTION_EVENT}`);
  }
}
