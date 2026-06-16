import './config/load-environment';

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { readRequiredEnv } from './common/read-required-env';
import { buildKafkaClientConfig } from '@innogram/shared';

const SWAGGER_PATH = process.env.SWAGGER_PATH ?? 'api/docs';

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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Innogram Notifications API')
    .setDescription('HTTP API for in-app notifications consumed by the client.')
    .setVersion(process.env.APP_VERSION ?? '1.0.0')
    .addTag('notifications')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(SWAGGER_PATH, app, swaggerDocument);

  const kafkaConfig = buildKafkaClientConfig();

  if (kafkaConfig) {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: kafkaConfig.brokers,
          clientId: 'notifications-microservice',
          ...(kafkaConfig.sasl
            ? {
                ssl: kafkaConfig.ssl ?? true,
                sasl: kafkaConfig.sasl as never,
              }
            : {}),
        },
        consumer: {
          groupId: 'notifications-consumer',
        },
      },
    });
  } else {
    logger.warn('KAFKA_BROKERS is not set — Kafka consumer is disabled');
  }

  if (kafkaConfig) {
    await app.startAllMicroservices();
  }
  await app.listen(httpPort);

  logger.log(`HTTP server started on port ${httpPort}`);
  logger.log(`Swagger docs available at /${SWAGGER_PATH}`);

  if (kafkaConfig) {
    logger.log('Kafka consumer started');
  }
}

void bootstrap();
