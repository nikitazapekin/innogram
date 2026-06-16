import { createServer, type Server } from 'node:http';

import { createApp } from './app';
import { loadConfig } from './config/app-config';
import { loadEnvironment } from './config/load-environment';
import { initSentry } from './observability/init-sentry';
import { createRefreshSessionService } from './services/refresh-session-service';
import { createLogger, serializeError } from './shared/logger';

loadEnvironment();
initSentry('auth-microservice');

const readRequiredString = (value: string | undefined, envName: string): string => {
  const parsedValue = value;

  if (!parsedValue) {
    throw new Error(`Missing required variable: ${envName}`);
  }

  return parsedValue;
};

const readRequiredPositiveInteger = (value: string | undefined, envName: string): number => {
  const rawValue = readRequiredString(value, envName);
  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    throw new Error(`Variable ${envName} must be a positive integer.`);
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
  const refreshSessionService = await createRefreshSessionService({ config, logger });

  const app = createApp({
    config,
    logger,
    refreshSessionService,
  });
  const server = createServer(app);

  configureServer(server);

  await listen(server, config.port);

  logger.info('HTTP server started', {
    port: config.port,
    swaggerPath: `/${process.env.AUTH_SWAGGER_PATH ?? 'api/docs'}`,
  });
};

void bootstrap().catch((error: unknown) => {
  const fallbackLogger = createLogger(SERVICE_NAME);

  fallbackLogger.error('Failed to start service', {
    error: serializeError(error),
  });
});
