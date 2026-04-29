import express, { type Express } from 'express';

import { createErrorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found-handler';
import { createRequestLogger } from './middleware/request-logger';
import { createSystemRouter } from './routes/system-routes';
import type { Logger } from './shared/logger';

const JSON_BODY_LIMIT = '16kb';

type CreateAppOptions = Readonly<{
  logger: Logger;
}>;

export const createApp = ({ logger }: CreateAppOptions): Express => {
  const app = express();

  app.use(createRequestLogger(logger));
  app.use(
    express.json({
      limit: JSON_BODY_LIMIT,
    }),
  );

  app.use(createSystemRouter());
  app.use(notFoundHandler);
  app.use(createErrorHandler(logger));

  return app;
};
