import { createServer, type Server } from 'node:http';

import { createApp } from './app';
import { loadConfig } from './config/app-config';
import { createAuthCoreProducer } from './kafka/auth-core-producer';
import { createLogger, serializeError } from './shared/logger';

export const SERVICE_NAME = 'auth-microservice';

const SERVER_REQUEST_TIMEOUT_MS = 30_000;

const configureServer = (server: Server): void => {
  server.requestTimeout = SERVER_REQUEST_TIMEOUT_MS;
};

const listen = (server: Server, port: number): Promise<void> =>
  new Promise((resolve, reject) => {
    const handleError = (error: Error): void => {
      server.off('listening', handleListening);
      reject(error);
    };

    const handleListening = (): void => {
      server.off('error', handleError);
      resolve();
    };

    server.once('error', handleError);
    server.once('listening', handleListening);
    server.listen(port);
  });

const bootstrap = async (): Promise<void> => {
  const config = loadConfig();
  const logger = createLogger(SERVICE_NAME);
  const authCoreProducer = await createAuthCoreProducer();

  const app = createApp({
    authCoreProducer,
    logger,
  });
  const server = createServer(app);

  configureServer(server);

  await listen(server, config.port);

  logger.info('HTTP server started', {
    port: config.port,
  });
};

void bootstrap().catch((error: unknown) => {
  const fallbackLogger = createLogger(SERVICE_NAME);

  fallbackLogger.error('Failed to start service', {
    error: serializeError(error),
  });
});
