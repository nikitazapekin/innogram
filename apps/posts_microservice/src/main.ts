import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';
import { POSTS_HTTP_PORT, createNatsServerOptions, QUEUES } from '@innogram/shared';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice(createNatsServerOptions(QUEUES.posts));

  await app.startAllMicroservices();
  await app.listen(POSTS_HTTP_PORT);
}

void bootstrap();
