import { ClientKafka } from '@nestjs/microservices';
import { loadEnvironment } from '../config/load-environment';

loadEnvironment();

const readRequiredString = (value: string | undefined, envName: string): string => {
  const parsedValue = value?.trim();

  if (!parsedValue) {
    throw new Error(`Missing required environment variable: ${envName}`);
  }

  return parsedValue;
};

const readKafkaBrokers = (): string[] =>
  readRequiredString(process.env.KAFKA_BROKERS, 'KAFKA_BROKERS')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);

export type AuthCoreUser = Readonly<{
  accountId: string | null;
  createdAt: string;
  email: string;
  id: number;
  passwordHash: string;
  updatedAt: string;
}>;

export type AuthCoreProducer = Readonly<{
  createUser: (payload: Readonly<{ email: string; passwordHash: string }>) => Promise<AuthCoreUser>;
  findUserByEmail: (payload: Readonly<{ email: string }>) => Promise<AuthCoreUser | null>;
}>;

export const createAuthCoreProducer = async (): Promise<AuthCoreProducer> => {
  const options = {
    client: {
      brokers: readKafkaBrokers(),
      clientId: 'auth-microservice',
    },
  };
  const client = new ClientKafka(options);

  client.subscribeToResponseOf('auth.core.find-user-by-email');
  client.subscribeToResponseOf('auth.core.create-user');
  await client.connect();

  const findUserByEmail = (payload: Readonly<{ email: string }>): Promise<AuthCoreUser | null> =>
    new Promise((resolve, reject) => {
      client
        .send<
          AuthCoreUser | null,
          Readonly<{ email: string }>
        >('auth.core.find-user-by-email', payload)
        .subscribe({
          next: (response) => resolve(response),
          error: (error: unknown) => {
            reject(error);
          },
        });
    });

  const createUser = (
    payload: Readonly<{ email: string; passwordHash: string }>,
  ): Promise<AuthCoreUser> =>
    new Promise((resolve, reject) => {
      client
        .send<
          AuthCoreUser,
          Readonly<{ email: string; passwordHash: string }>
        >('auth.core.create-user', payload)
        .subscribe({
          next: (response) => resolve(response),
          error: (error: unknown) => {
            reject(error);
          },
        });
    });

  return {
    createUser,
    findUserByEmail,
  };
};
