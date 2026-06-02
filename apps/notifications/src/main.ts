import './config/load-environment';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

import { AppModule } from './app.module';
import { readRequiredEnv } from './common/read-required-env';

const readKafkaBrokers = (): string[] =>
  readRequiredEnv('KAFKA_BROKERS')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const httpPort = Number(readRequiredEnv('NOTIFICATIONS_HTTP_PORT'));

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: readKafkaBrokers(),
        clientId: 'notifications-microservice',
      },
      consumer: {
        groupId: 'notifications-consumer',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(httpPort);

  logger.log(`HTTP server started on port ${httpPort}`);
  logger.log('Kafka consumer started');
}

void bootstrap();
