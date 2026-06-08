import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedAuthGuard, SharedAuthModule } from '@innogram/shared';
import * as bcrypt from 'bcrypt';
import request from 'supertest';

import { AuthModule } from '../../src/auth/auth.module';
import { DatabaseConfigService } from '../../src/database.config';
import { KafkaModule } from '../../src/kafka/kafka.module';
import { PostsModule } from '../../src/posts/posts.module';
import { createTestAccessToken } from '../test-jwt';
import { applyPostsIntegrationMocks, configureIntegrationApp } from './integration-app';
import { INTEGRATION_ENTITIES } from './test-entities';

const itIfDb = process.env.TEST_DB_AVAILABLE === 'true' ? it : it.skip;
const testEmail = (label: string): string => `integration-${label}-${Date.now()}@example.com`;

describe('PostsModule (integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await applyPostsIntegrationMocks(
      Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
          SharedAuthModule.forRoot({
            authServiceUrl: process.env.AUTH_SERVICE_URL!,
          }),
          TypeOrmModule.forRootAsync({ useClass: DatabaseConfigService }),
          TypeOrmModule.forFeature(INTEGRATION_ENTITIES),
          KafkaModule,
          AuthModule,
          PostsModule,
        ],
        providers: [
          {
            provide: APP_GUARD,
            useClass: SharedAuthGuard,
          },
        ],
      }),
    ).compile();

    app = moduleFixture.createNestApplication();
    configureIntegrationApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  itIfDb('should require bearer token', () => {
    return request(app.getHttpServer())
      .get('/posts')
      .expect(401)
      .expect(({ body }) => {
        expect(body.error.message).toEqual('Authorization header is required.');
      });
  });

  itIfDb('should reject malformed authorization header', () => {
    return request(app.getHttpServer())
      .get('/posts')
      .set('Authorization', 'Token invalid')
      .expect(401)
      .expect(({ body }) => {
        expect(body.error.message).toEqual('Authorization header must use Bearer token.');
      });
  });

  itIfDb('should return posts for authenticated user', async () => {
    const email = testEmail('posts');
    const passwordHash = await bcrypt.hash('posts-password', 4);

    const { body: user } = await request(app.getHttpServer())
      .post('/auth/user')
      .send({ email, provider: 'local', passwordHash })
      .expect(201);

    const token = createTestAccessToken(email);

    await request(app.getHttpServer())
      .get('/posts')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect(({ body }) => {
        expect(body.data).toEqual(expect.any(Array));
        expect(body.total).toEqual(expect.any(Number));
        expect(body.page).toEqual(1);
        expect(body.limit).toEqual(10);
      });

    await request(app.getHttpServer()).delete(`/auth/user/${user.id}`).expect(200);
  });
});
