import { createServer, type Server } from 'node:http';

import { createApp } from './app';
import { loadConfig } from './config/app-config';
import { loadEnvironment } from './config/load-environment';
import { createAuthSessionService } from './services/auth-session-service';
import { createRedisSessionStore } from './services/redis-session-store';
import { createLogger, serializeError } from './shared/logger';

loadEnvironment();

const readRequiredString = (value: string | undefined, envName: string): string => {
  const parsedValue = value?.trim();

  if (!parsedValue) {
    throw new Error(`Missing required environment variable: ${envName}`);
  }

  return parsedValue;
};

const readRequiredPositiveInteger = (value: string | undefined, envName: string): number => {
  const rawValue = readRequiredString(value, envName);
  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`Environment variable ${envName} must be a positive integer.`);
  }

  return parsedValue;
};

export const SERVICE_NAME = readRequiredString(process.env.AUTH_SERVICE_NAME, 'AUTH_SERVICE_NAME');
const SERVER_REQUEST_TIMEOUT_MS = readRequiredPositiveInteger(
  process.env.AUTH_SERVER_REQUEST_TIMEOUT_MS,
  'AUTH_SERVER_REQUEST_TIMEOUT_MS',
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
  const sessionStore = createRedisSessionStore({
    logger,
    redisUrl: config.redisUrl,
  });

  await sessionStore.connect();

  const authSessionService = createAuthSessionService({
    config,
    sessionStore,
  });

  const app = createApp({
    authSessionService,
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
