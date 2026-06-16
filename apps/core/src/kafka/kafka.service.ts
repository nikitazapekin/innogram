import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxyFactory, Transport, type ClientProxy } from '@nestjs/microservices';
import { buildKafkaClientConfig } from '@innogram/shared';

export type MentionEvent = {
  sourceType: 'post' | 'comment';
  sourceId: number;
  authorProfileId: number;
  mentionedProfileId: number;
};

@Injectable()
export class KafkaService implements OnModuleInit {
  private readonly logger = new Logger(KafkaService.name);
  private client: ClientProxy;

  async onModuleInit(): Promise<void> {
    const kafkaConfig = buildKafkaClientConfig();

    if (!kafkaConfig) {
      this.logger.warn('KAFKA_BROKERS not set, Kafka producer disabled');

      return;
    }

    try {
      this.client = ClientProxyFactory.create({
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: kafkaConfig.brokers,
            clientId: 'core-microservice',
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

      await this.client.connect();
      this.logger.log('Connected to Kafka');
    } catch (error) {
      this.logger.error('Failed to connect to Kafka', error);
    }
  }

  async emitMentionEvent(event: MentionEvent): Promise<void> {
    if (!this.client) {
      this.logger.warn('Kafka client not available, skipping event');

      return;
    }

    const topic = process.env.MENTION_EVENTS_TOPIC ?? 'mention.events';

    try {
      await new Promise<void>((resolve, reject) => {
        this.client
          .emit(topic, event)
          .subscribe({ complete: () => resolve(), error: (err) => reject(err) });
      });
    } catch (error) {
      this.logger.error('Failed to emit mention event', error);
    }
  }
}
