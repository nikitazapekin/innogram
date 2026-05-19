import type { Response } from 'express';

import { RouteError } from '../shared/route-error';

export const sendRouteErrorResponse = (response: Response, error: RouteError): void => {
  response.status(error.status).json({
    error: error.code,
    message: error.message,
  });
};
