import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

const CORE_HTTP_PORT = Number(process.env.CORE_HTTP_PORT ?? 3001);
const SWAGGER_PATH = process.env.SWAGGER_PATH ?? 'api/docs';
const CLIENT_ORIGIN = 'http://localhost:3000';

type SecurityHeadersResponse = {
  setHeader: (name: string, value: string) => void;
};

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [CLIENT_ORIGIN, 'http://127.0.0.1:3000'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.use((_req: unknown, res: SecurityHeadersResponse, next: () => void) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    next();
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Innogram Core Microservice')
    .setDescription(
      'Core HTTP API for working with Innogram entities and routing requests to platform services.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(SWAGGER_PATH, app, swaggerDocument);

  await app.listen(CORE_HTTP_PORT);
  logger.log(`HTTP server started on port ${CORE_HTTP_PORT}`);
  logger.log(`Swagger docs available at /${SWAGGER_PATH}`);
}

void bootstrap();
