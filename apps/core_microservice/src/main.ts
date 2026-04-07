import 'reflect-metadata';

import { existsSync } from 'node:fs';
import { dirname, join, parse } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CORE_HTTP_PORT, SWAGGER_PATH } from '@innogram/shared';

function setProjectRootAsCurrentWorkingDirectory(): void {
  let currentPath = __dirname;
  const { root } = parse(currentPath);

  while (true) {
    const packageJsonPath = join(currentPath, 'package.json');
    const envPath = join(currentPath, '.env');

    if (existsSync(packageJsonPath) && existsSync(envPath)) {
      process.chdir(currentPath);
      return;
    }

    if (currentPath === root) {
      return;
    }

    currentPath = dirname(currentPath);
  }
}

async function bootstrap() {
  setProjectRootAsCurrentWorkingDirectory();
  const { AppModule } = await import('./app.module');

  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Innogram Core Microservice')
    .setDescription(
      'API Gateway for authenticating client requests and routing calls to NATS microservices.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(SWAGGER_PATH, app, swaggerDocument);

  await app.listen(CORE_HTTP_PORT);
}

void bootstrap();
