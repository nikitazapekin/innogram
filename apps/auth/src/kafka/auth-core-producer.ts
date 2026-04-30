import { ClientProxyFactory, Transport, type ClientProxy } from '@nestjs/microservices';
import { config as loadEnvironment } from 'dotenv';

loadEnvironment();

const readRequiredString = (value: string | undefined, envName: string): string => {
  const parsedValue = value?.trim();

  if (!parsedValue) {
    throw new Error(`Missing required environment variable: ${envName}`);
  }

  return parsedValue;
};

const readSignupTopic = (): string =>
  readRequiredString(process.env.AUTH_CORE_SIGNUP_TOPIC, 'AUTH_CORE_SIGNUP_TOPIC');

const readKafkaBrokers = (): string[] =>
  readRequiredString(process.env.KAFKA_BROKERS, 'KAFKA_BROKERS')
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);

export type AuthCoreProducer = Readonly<{
  sendSignupMessage: () => Promise<void>;
}>;

export const createAuthCoreProducer = async (): Promise<AuthCoreProducer> => {
  const client: ClientProxy = ClientProxyFactory.create({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: readKafkaBrokers(),
        clientId: 'auth-microservice',
      },
      producerOnlyMode: true,
    },
  });

  await client.connect();

  const sendMessage = (): Promise<void> =>
    new Promise((resolve, reject) => {
      client
        .emit(readSignupTopic(), {
          source: 'auth-microservice',
        })
        .subscribe({
          complete: () => {
            resolve();
          },
          error: (error: unknown) => {
            reject(error);
          },
        });
    });

  return {
    sendSignupMessage: sendMessage,
  };
};
