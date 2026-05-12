import 'reflect-metadata';

import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';

loadDotenv({
  path: resolve(__dirname, '..', '..', '..', '.env'),
});

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

const API_GATEWAY_PORT = Number(process.env.API_GATEWAY_PORT ?? 3002);

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  await app.listen(API_GATEWAY_PORT);
}

void bootstrap();
