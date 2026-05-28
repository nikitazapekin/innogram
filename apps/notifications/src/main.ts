import 'reflect-metadata';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';

const readRequiredEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
};

const NOTIFICATIONS_HTTP_PORT = Number(readRequiredEnv('NOTIFICATIONS_HTTP_PORT'));

const readKafkaBrokers = (): string[] =>
  readRequiredEnv('KAFKA_BROKERS')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.connectMicroservice({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: readKafkaBrokers(),
        clientId: 'notifications-microservice',
      },
      consumer: {
        groupId: 'notifications-consumer',
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  });

  await app.startAllMicroservices();
  logger.log('Kafka consumer started');

  await app.listen(NOTIFICATIONS_HTTP_PORT);
  logger.log(`HTTP server started on port ${NOTIFICATIONS_HTTP_PORT}`);
}

void bootstrap();
