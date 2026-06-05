import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consumer, EachMessagePayload, Kafka } from 'kafkajs';

import { Notification } from '../entities/notification.entity';

type MentionEvent = {
  sourceType: 'post' | 'comment';
  sourceId: number;
  authorProfileId: number;
  mentionedProfileId: number;
};

@Injectable()
export class MentionConsumer implements OnModuleInit {
  private readonly logger = new Logger(MentionConsumer.name);
  private consumer: Consumer;

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  async onModuleInit(): Promise<void> {
    const brokers = process.env.KAFKA_BROKERS;

    if (!brokers) {
      this.logger.warn('KAFKA_BROKERS not set, consumer disabled');

      return;
    }

    const kafka = new Kafka({
      clientId: 'notifications-microservice',
      brokers: brokers.split(',').map((b) => b.trim()),
    });

    this.consumer = kafka.consumer({ groupId: 'notifications-group' });
    await this.consumer.connect();
    this.logger.log('Kafka consumer connected');

    const topic = process.env.MENTION_EVENTS_TOPIC ?? 'mention.events';

    await this.consumer.subscribe({ topic, fromBeginning: false });

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        await this.handleMessage(payload);
      },
    });

    this.logger.log(`Subscribed to topic: ${topic}`);
  }

  private async handleMessage({ message }: EachMessagePayload): Promise<void> {
    try {
      const event: MentionEvent = JSON.parse(message.value?.toString() ?? '{}');

      this.logger.log(
        `Processing mention event: ${event.sourceType}#${event.sourceId} -> profile ${event.mentionedProfileId}`,
      );

      const notification = this.notificationRepository.create({
        recipientProfileId: event.mentionedProfileId,
        type: 'mention',
        payload: {
          sourceType: event.sourceType,
          sourceId: event.sourceId,
          authorProfileId: event.authorProfileId,
        },
      });

      await this.notificationRepository.save(notification);
      this.logger.log(`Notification saved for profile ${event.mentionedProfileId}`);
    } catch (error) {
      this.logger.error('Failed to process mention event', error);
    }
  }
}
