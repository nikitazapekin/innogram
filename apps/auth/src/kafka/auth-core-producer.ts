import { ClientProxyFactory, Transport, type ClientProxy } from '@nestjs/microservices';

const AUTH_CORE_SIGNUP_TOPIC = 'auth.core.stub';
const DEFAULT_KAFKA_BROKERS = 'localhost:9092';

const readKafkaBrokers = (): string[] =>
  (process.env.KAFKA_BROKERS ?? DEFAULT_KAFKA_BROKERS)
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
        .emit(AUTH_CORE_SIGNUP_TOPIC, {
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
