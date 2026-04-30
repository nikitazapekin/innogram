import { createServer, type Server } from 'node:http';

import { createApp } from './app';
import { loadConfig } from './config/app-config';
import { createLogger, serializeError } from './shared/logger';

const DEFAULT_SERVICE_NAME = 'auth-microservice';
const DEFAULT_SERVER_REQUEST_TIMEOUT_MS = 30_000;

export const SERVICE_NAME = process.env.AUTH_SERVICE_NAME?.trim() || DEFAULT_SERVICE_NAME;
const SERVER_REQUEST_TIMEOUT_MS = Number(
  process.env.AUTH_SERVER_REQUEST_TIMEOUT_MS?.trim() || DEFAULT_SERVER_REQUEST_TIMEOUT_MS,
);

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

  const app = createApp({
    config,
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
