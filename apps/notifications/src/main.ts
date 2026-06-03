import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';

dotenvConfig({ path: resolve(__dirname, '../../../.env') });

import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

const NOTIFICATIONS_HTTP_PORT = Number(process.env.NOTIFICATIONS_HTTP_PORT ?? 3006);

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  await app.listen(NOTIFICATIONS_HTTP_PORT);
  logger.log(`HTTP server started on port ${NOTIFICATIONS_HTTP_PORT}`);
}

void bootstrap();
