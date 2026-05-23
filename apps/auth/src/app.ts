import express, { type Express } from 'express';

import type { AppConfig } from './config/app-config';
import { createErrorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found-handler';
import { createRequestLogger } from './middleware/request-logger';
import { createAuthRouter } from './routes/auth';
import { createSystemRouter } from './routes/system';
import type { RefreshSessionService } from './services/refresh-session-service';
import type { Logger } from './shared/logger';

const JSON_BODY_LIMIT = '16kb';

type CreateAppOptions = Readonly<{
  config: AppConfig;
  logger: Logger;
  refreshSessionService: RefreshSessionService;
}>;

export const createApp = ({ config, logger, refreshSessionService }: CreateAppOptions): Express => {
  const app = express();

  app.use((_request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.setHeader('Access-Control-Allow-Credentials', 'true');

    if (_request.method === 'OPTIONS') {
      response.status(204).end();

      return;
    }

    next();
  });

  app.use(createRequestLogger(logger));
  app.use(express.json({ limit: JSON_BODY_LIMIT }));
  app.use(createSystemRouter());
  app.use(createAuthRouter({ config, refreshSessionService }));
  app.use(notFoundHandler);
  app.use(createErrorHandler(logger));

  return app;
};
