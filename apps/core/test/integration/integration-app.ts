import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TestingModuleBuilder } from '@nestjs/testing';
import { SharedJwksClientService } from '@innogram/shared';

import { MINIO_CLIENT } from '../../src/assets/assets.module';
import { AssetsService } from '../../src/assets/assets.service';
import { AllExceptionsFilter } from '../../src/common/filters/all-exceptions.filter';
import { NotificationEventsProducer } from '../../src/kafka/notification-events.producer';
import { TEST_JWT_KID, testPublicKeyPem } from '../test-jwt';
import './db';

const noopKafkaProducer = {
  onModuleInit: async (): Promise<void> => undefined,
  onModuleDestroy: async (): Promise<void> => undefined,
  emitMention: async (): Promise<void> => undefined,
  emitUserSubscribed: async (): Promise<void> => undefined,
};

export const configureIntegrationApp = (app: INestApplication): void => {
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new AllExceptionsFilter());
};

export const applyPostsIntegrationMocks = (builder: TestingModuleBuilder): TestingModuleBuilder =>
  builder
    .overrideProvider(NotificationEventsProducer)
    .useValue(noopKafkaProducer)
    .overrideProvider(MINIO_CLIENT)
    .useValue({})
    .overrideProvider(AssetsService)
    .useValue({
      getAssetUrl: async (id: number): Promise<string> => `http://localhost/assets/${id}`,
    })
    .overrideProvider(SharedJwksClientService)
    .useValue({
      getPublicKey: async (kid: string): Promise<string> => {
        if (kid !== TEST_JWT_KID) {
          throw new Error(`Unexpected key id: ${kid}`);
        }

        return testPublicKeyPem;
      },
    });
