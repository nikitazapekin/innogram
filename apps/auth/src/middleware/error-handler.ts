import type { ErrorRequestHandler } from 'express';

import type { Logger } from '../shared/logger';
import { serializeError } from '../shared/logger';

const isInvalidJsonError = (error: unknown): boolean => {
  if (!(error instanceof SyntaxError)) {
    return false;
  }

  if (typeof error !== 'object' || error === null) {
    return false;
  }

  return 'type' in error && 'status' in error && error.status === 400;
};

const isPayloadTooLargeError = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  return 'status' in error && error.status === 413;
};

export const createErrorHandler = (logger: Logger): ErrorRequestHandler => {
  return (error: unknown, request, response, _next) => {
    if (isInvalidJsonError(error)) {
      response.status(400).json({
        error: 'INVALID_JSON',
        message: 'Request body must contain valid JSON.',
      });

      return;
    }

    if (isPayloadTooLargeError(error)) {
      response.status(413).json({
        error: 'PAYLOAD_TOO_LARGE',
        message: 'Request body exceeded the allowed size.',
      });

      return;
    }

    logger.error('Unhandled request error', {
      error: serializeError(error),
      method: request.method,
      path: request.originalUrl,
    });

    response.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Internal server error.',
    });
  };
};
