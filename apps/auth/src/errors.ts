import type { ErrorRequestHandler, NextFunction, Request, RequestHandler, Response } from 'express';

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function asyncHandler(
  handler: (request: Request, response: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (request, response, next) => {
    void handler(request, response, next).catch(next);
  };
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof HttpError) {
    const payload: Record<string, unknown> = {
      error: error.code,
      message: error.message,
    };

    if (error.details !== undefined) {
      payload.details = error.details;
    }

    response.status(error.statusCode).json(payload);

    return;
  }

  console.error('Unhandled auth microservice error', error);
  response.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error.',
  });
};
