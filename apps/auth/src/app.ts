import express, { type Express, type NextFunction, type Request, type Response } from 'express';

import type { AppConfig } from './config/app-config';
import { handleAuthRoute } from './routes/auth';
import { handleSystemRoute } from './routes/system';
import type { Logger } from './shared/logger';
import { serializeError } from './shared/logger';

const JSON_BODY_LIMIT = '16kb';

type CreateAppOptions = Readonly<{
  config: AppConfig;
  logger: Logger;
}>;

const toQueryRecord = (query: Request['query']): Record<string, string> => {
  const queryRecord: Record<string, string> = {};

  for (const key in query) {
    const value = query[key];

    if (typeof value === 'string') {
      queryRecord[key] = value;
    }
  }

  return queryRecord;
};

export const createApp = ({ config, logger }: CreateAppOptions): Express => {
  const app = express();

  app.use(express.json({ limit: JSON_BODY_LIMIT }));

  app.use(async (request: Request, response: Response, _next: NextFunction) => {
    const startedAt = process.hrtime.bigint();
    const routeRequest = {
      body: request.body,
      method: request.method,
      path: request.path,
      query: toQueryRecord(request.query),
      url: request.originalUrl,
    };
    const systemResponse = {
      json: (statusCode: number, body: unknown) => {
        response.status(statusCode).json(body);
      },
    };
    const authResponse = {
      json: (statusCode: number, body: unknown) => {
        response.status(statusCode).json(body);
      },
      redirect: (statusCode: number, location: string) => {
        response.redirect(statusCode, location);
      },
    };

    try {
      const isSystemRouteHandled = await handleSystemRoute(request, systemResponse);

      if (isSystemRouteHandled) {
        return;
      }

      const isAuthRouteHandled = await handleAuthRoute(routeRequest, authResponse, config);

      if (isAuthRouteHandled) {
        return;
      }

      response.status(404).json({
        error: 'NOT_FOUND',
        message: `Route ${request.method} ${request.originalUrl} was not found.`,
      });
    } catch (error: unknown) {
      logger.error('Unhandled request error', {
        error: serializeError(error),
        method: request.method,
        path: request.path,
      });

      response.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error.',
      });
    } finally {
      if (request.path !== '/health') {
        logger.info('Request completed', {
          durationMs: Number((Number(process.hrtime.bigint() - startedAt) / 1_000_000).toFixed(2)),
          method: request.method,
          path: request.path,
          statusCode: response.statusCode,
        });
      }
    }
  });

  return app;
};
