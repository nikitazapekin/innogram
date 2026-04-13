import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const CORE_HTTP_PORT = Number(process.env.CORE_HTTP_PORT ?? 3001);
const SWAGGER_PATH = process.env.SWAGGER_PATH ?? 'api/docs';

async function bootstrap() {
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
