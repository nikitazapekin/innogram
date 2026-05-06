import express, { type Express } from 'express';

import type { AppConfig } from './config/app-config';
import { createErrorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found-handler';
import { createRequestLogger } from './middleware/request-logger';
import { createAuthRouter } from './routes/auth';
import { createSystemRouter } from './routes/system';
import type { AuthSessionService } from './services/auth-session-service';
import type { Logger } from './shared/logger';

const JSON_BODY_LIMIT = '16kb';

type CreateAppOptions = Readonly<{
  authSessionService: AuthSessionService;
  config: AppConfig;
  logger: Logger;
}>;

export const createApp = ({ authSessionService, config, logger }: CreateAppOptions): Express => {
  const app = express();

  app.use(createRequestLogger(logger));
  app.use(
    express.json({
      limit: JSON_BODY_LIMIT,
    }),
  );

  app.use(createSystemRouter());
  app.use(
    createAuthRouter({
      authSessionService,
      config,
    }),
  );
  app.use(notFoundHandler);
  app.use(createErrorHandler(logger));

  return app;
};
