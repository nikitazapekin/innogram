import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

import { readRequiredEnv } from '../common/read-required-env';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private client: ClientProxy;

  constructor() {
    const brokers = readRequiredEnv('KAFKA_BROKERS').split(',').filter(Boolean);

    this.client = ClientProxyFactory.create({
      transport: Transport.KAFKA,
      options: {
        client: { brokers, clientId: 'core-microservice' },
        producerOnlyMode: true,
      },
    });
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.close();
  }

  emit(topic: string, data: Record<string, unknown>): void {
    this.client.emit(topic, data).subscribe({
      error: (err: unknown) => {
        console.error(`[Kafka] Failed to emit event "${topic}":`, err);
      },
    });
  }
}
