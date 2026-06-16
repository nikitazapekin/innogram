import { ClientProxyFactory, Transport, type ClientProxy } from '@nestjs/microservices';
import { buildKafkaClientConfig } from '@innogram/shared';
import { loadEnvironment } from '../config/load-environment';

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

export type AuthCoreProducer = Readonly<{
  sendSignupMessage: () => Promise<void>;
}>;

export const createAuthCoreProducer = async (): Promise<AuthCoreProducer | null> => {
  const kafkaConfig = buildKafkaClientConfig();

  if (!kafkaConfig) {
    return null;
  }

  const client: ClientProxy = ClientProxyFactory.create({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: kafkaConfig.brokers,
        clientId: 'auth-microservice',
        ...(kafkaConfig.sasl
          ? {
              ssl: kafkaConfig.ssl ?? true,
              sasl: kafkaConfig.sasl as never,
            }
          : {}),
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
