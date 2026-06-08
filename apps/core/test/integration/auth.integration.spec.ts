import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import request from 'supertest';

import { AuthModule } from '../../src/auth/auth.module';
import { DatabaseConfigService } from '../../src/database.config';
import { configureIntegrationApp } from './integration-app';
import { INTEGRATION_ENTITIES } from './test-entities';

const itIfDb = process.env.TEST_DB_AVAILABLE === 'true' ? it : it.skip;
const testEmail = (label: string): string => `integration-${label}-${Date.now()}@example.com`;

describe('AuthModule (integration)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        TypeOrmModule.forRootAsync({ useClass: DatabaseConfigService }),
        TypeOrmModule.forFeature(INTEGRATION_ENTITIES),
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureIntegrationApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  itIfDb('should create a user', async () => {
    const email = testEmail('create');

    return request(app.getHttpServer())
      .post('/auth/user')
      .send({
        email,
        provider: 'local',
        passwordHash: await bcrypt.hash('secret-password', 4),
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body.email).toEqual(email);
        expect(body.id).toEqual(expect.any(Number));
      })
      .then(async ({ body }) => {
        await request(app.getHttpServer()).delete(`/auth/user/${body.id}`).expect(200);
      });
  });

  itIfDb('should return user by email', async () => {
    const email = testEmail('lookup');
    const passwordHash = await bcrypt.hash('lookup-password', 4);

    const { body: created } = await request(app.getHttpServer())
      .post('/auth/user')
      .send({ email, provider: 'local', passwordHash })
      .expect(201);

    await request(app.getHttpServer())
      .get('/auth/user')
      .query({ email })
      .expect(200)
      .expect(({ body }) => {
        expect(body.id).toEqual(created.id);
        expect(body.email).toEqual(email);
      });

    await request(app.getHttpServer()).delete(`/auth/user/${created.id}`).expect(200);
  });

  itIfDb('should verify credentials', async () => {
    const email = testEmail('verify');
    const password = 'verify-password-123';
    const passwordHash = await bcrypt.hash(password, 4);

    const { body: created } = await request(app.getHttpServer())
      .post('/auth/user')
      .send({ email, provider: 'local', passwordHash })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/user/verify')
      .send({ email, password })
      .expect(201)
      .expect(({ body }) => {
        expect(body.id).toEqual(created.id);
        expect(body.email).toEqual(email);
      });

    await request(app.getHttpServer())
      .post('/auth/user/verify')
      .send({ email, password: 'wrong-password' })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({});
      });

    await request(app.getHttpServer()).delete(`/auth/user/${created.id}`).expect(200);
  });

  itIfDb('should return conflict for duplicate email', async () => {
    const email = testEmail('conflict');
    const passwordHash = await bcrypt.hash('conflict-password', 4);

    const { body: created } = await request(app.getHttpServer())
      .post('/auth/user')
      .send({ email, provider: 'local', passwordHash })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/user')
      .send({ email, provider: 'local', passwordHash })
      .expect(409)
      .expect(({ body }) => {
        expect(body.error.message).toEqual('User already exists');
      });

    await request(app.getHttpServer()).delete(`/auth/user/${created.id}`).expect(200);
  });

  itIfDb('should delete user and return not found for missing id', async () => {
    const email = testEmail('delete');
    const passwordHash = await bcrypt.hash('delete-password', 4);

    const { body: created } = await request(app.getHttpServer())
      .post('/auth/user')
      .send({ email, provider: 'local', passwordHash })
      .expect(201);

    await request(app.getHttpServer()).delete(`/auth/user/${created.id}`).expect(200);

    await request(app.getHttpServer())
      .get('/auth/user')
      .query({ email })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual({});
      });

    await request(app.getHttpServer())
      .delete('/auth/user/999999999')
      .expect(404)
      .expect(({ body }) => {
        expect(body.error.message).toEqual('User was not found.');
      });
  });

  itIfDb('should reject invalid payload', () => {
    return request(app.getHttpServer())
      .post('/auth/user')
      .send({ email: 'not-an-email', provider: 'local' })
      .expect(400)
      .expect(({ body }) => {
        expect(body.success).toBe(false);
        expect(body.error.message).toEqual(expect.any(Array));
      });
  });
});
