import { Router } from 'express';

import type { AppConfig } from '../config/app-config';
import { parseLoginRequestBody, parseRegisterRequestBody } from '../services/auth-request-parser';
import { buildAuthResponse } from '../services/auth-response-service';
import { hashPassword } from '../services/password-service';
import { RouteError } from '../shared/route-error';

type CreateAuthRouterOptions = Readonly<{
  config: AppConfig;
}>;

export const createAuthRouter = ({ config }: CreateAuthRouterOptions): Router => {
  const router = Router();

  router.post('/auth/register', async (request, response, next) => {
    try {
      const { email, password } = parseRegisterRequestBody(request.body);
      const passwordHash = await hashPassword(password, config);
      const authResponse = buildAuthResponse(email, passwordHash, config);

      response.status(201).json(authResponse);
    } catch (error: unknown) {
      if (error instanceof RouteError) {
        response.status(error.status).json({
          error: error.code,
          message: error.message,
        });

        return;
      }

      next(error);
    }
  });

  router.post('/auth/login', async (request, response, next) => {
    try {
      const { email, password } = parseLoginRequestBody(request.body);
      const passwordHash = await hashPassword(password, config);
      const authResponse = buildAuthResponse(email, passwordHash, config);

      response.status(200).json(authResponse);
    } catch (error: unknown) {
      if (error instanceof RouteError) {
        response.status(error.status).json({
          error: error.code,
          message: error.message,
        });

        return;
      }

      next(error);
    }
  });

  return router;
};
