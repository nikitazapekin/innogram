import type { RequestHandler } from 'express';

import type { Logger } from '../shared/logger';

export const createRequestLogger = (logger: Logger): RequestHandler => {
  return (request, response, next) => {
    const startedAt = process.hrtime.bigint();

    response.on('finish', () => {
      if (request.path === '/health') {
        return;
      }

      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

      logger.info('Request completed', {
        durationMs: Number(durationMs.toFixed(2)),
        method: request.method,
        path: request.originalUrl,
        statusCode: response.statusCode,
      });
    });

    next();
  };
};
