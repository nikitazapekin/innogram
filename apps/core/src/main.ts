import { initTracing } from '@innogram/shared';

initTracing({ serviceName: 'innogram-core' });

import './config/load-environment';

import { parseAllowedOrigins } from '@innogram/shared';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'node:path';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { initSentry } from './observability/init-sentry';

initSentry('core-microservice');

const CORE_HTTP_PORT = Number(process.env.CORE_HTTP_PORT ?? 3001);
const SWAGGER_PATH = process.env.SWAGGER_PATH ?? 'api/docs';
const ALLOWED_ORIGINS = parseAllowedOrigins();

type SecurityHeadersResponse = {
  setHeader: (name: string, value: string) => void;
};

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useWebSocketAdapter(new IoAdapter(app));

  app.enableCors({
    origin: [...ALLOWED_ORIGINS],
    credentials: true,
  });

  app.useStaticAssets(path.resolve('uploads'), { prefix: '/uploads' });

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(new AllExceptionsFilter());
  app.use((_req: unknown, res: SecurityHeadersResponse, next: () => void) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    next();
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Innogram Core API')
    .setDescription(
      'Core HTTP API for profiles, posts, comments, assets, chats, and notifications. ' +
        'Protected endpoints require a Bearer access token issued by the auth service.',
    )
    .setVersion(process.env.APP_VERSION ?? '1.0.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
      'access-token',
    )
    .addTag('posts', 'Post feed and interactions')
    .addTag('users', 'Profiles and social graph')
    .addTag('comments', 'Comment threads')
    .addTag('assets', 'Media uploads and URLs')
    .addTag('chats', 'Chat attachments')
    .addTag('notifications', 'In-app notifications')
    .addTag('monitoring', 'Performance and Prometheus metrics')
    .addTag('auth (internal)', 'Internal auth user management (service-to-service)')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(SWAGGER_PATH, app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(CORE_HTTP_PORT);
  logger.log(`HTTP server started on port ${CORE_HTTP_PORT}`);
  logger.log(`Swagger docs available at /${SWAGGER_PATH}`);
}

void bootstrap();
