import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { buildKafkaClientConfig, type KafkaClientConfig } from '@innogram/shared';
import { firstValueFrom } from 'rxjs';

import {
  MENTION_EVENT,
  MentionEventPayload,
  USER_SUBSCRIBED_EVENT,
  UserSubscribedEventPayload,
} from './kafka.constants';

@Injectable()
export class NotificationEventsProducer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationEventsProducer.name);
  private client: ClientProxy | null = null;
  private kafkaConfig: KafkaClientConfig | null = null;
  private connectPromise: Promise<ClientProxy | null> | null = null;
  private disabled = false;

  onModuleInit(): void {
    try {
      this.kafkaConfig = buildKafkaClientConfig();
    } catch (error) {
      this.disabled = true;
      this.logger.error(
        'Invalid Kafka configuration — notification events are disabled',
        error instanceof Error ? error.message : String(error),
      );

      return;
    }

    if (!this.kafkaConfig) {
      this.logger.warn('KAFKA_BROKERS is not set — notification events are disabled');
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client?.close();
  }

  async emitUserSubscribed(payload: UserSubscribedEventPayload): Promise<void> {
    const client = await this.getClient();

    if (!client) {
      this.logger.warn(`Skipped ${USER_SUBSCRIBED_EVENT} — Kafka is not configured`);

      return;
    }

    try {
      await firstValueFrom(client.emit(USER_SUBSCRIBED_EVENT, payload));
      this.logger.log(`Emitted ${USER_SUBSCRIBED_EVENT}`);
    } catch (error) {
      this.logger.error(
        `Failed to emit ${USER_SUBSCRIBED_EVENT}`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async emitMention(payload: MentionEventPayload): Promise<void> {
    const client = await this.getClient();

    if (!client) {
      this.logger.warn(`Skipped ${MENTION_EVENT} — Kafka is not configured`);

      return;
    }

    try {
      await firstValueFrom(client.emit(MENTION_EVENT, payload));
      this.logger.log(`Emitted ${MENTION_EVENT}`);
    } catch (error) {
      this.logger.error(
        `Failed to emit ${MENTION_EVENT}`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  private async getClient(): Promise<ClientProxy | null> {
    if (this.disabled || !this.kafkaConfig) {
      return null;
    }

    if (this.client) {
      return this.client;
    }

    if (!this.connectPromise) {
      this.connectPromise = this.connectClient(this.kafkaConfig);
    }

    return this.connectPromise;
  }

  private async connectClient(kafkaConfig: KafkaClientConfig): Promise<ClientProxy | null> {
    try {
      const client = ClientProxyFactory.create({
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: kafkaConfig.brokers,
            clientId: 'core-microservice',
            connectionTimeout: 10_000,
            ...(kafkaConfig.sasl
              ? {
                  ssl: kafkaConfig.ssl ?? true,
                  sasl: kafkaConfig.sasl as never,
                }
              : {}),
          },
          producerOnlyMode: true,
        },
      });

      await client.connect();
      this.client = client;
      this.logger.log('Kafka producer connected');

      return client;
    } catch (error) {
      this.disabled = true;
      this.logger.error(
        'Failed to connect Kafka producer — notification events are disabled',
        error instanceof Error ? error.message : String(error),
      );

      return null;
    } finally {
      this.connectPromise = null;
    }
  }
}
