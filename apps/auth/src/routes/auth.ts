import { Router } from 'express';

import { createAuthController } from '../controllers/auth-controller';
import { sendRouteErrorResponse } from '../controllers/route-error-response';
import { createLogoutController } from '../controllers/logout-controller';
import { createRefreshController } from '../controllers/refresh-controller';
import type { AppConfig } from '../config/app-config';
import { validateAuthorizationHeader } from '../services/auth-token-service';
import type { RefreshSessionService } from '../services/refresh-session-service';
import { getAccessTokenJwks } from '../services/token-service';
import { RouteError } from '../shared/route-error';

type CreateAuthRouterOptions = Readonly<{
  config: AppConfig;
  refreshSessionService: RefreshSessionService;
}>;

export const createAuthRouter = ({
  config,
  refreshSessionService,
}: CreateAuthRouterOptions): Router => {
  const router = Router();

  const authController = createAuthController({
    config,
    refreshSessionService,
  });
  const refreshController = createRefreshController({
    config,
    refreshSessionService,
  });
  const logoutController = createLogoutController({
    refreshSessionService,
  });

  router.get('/.well-known/jwks.json', (_request, response) => {
    response.json(getAccessTokenJwks(config.accessTokenPrivateKey, config.accessTokenKeyId));
  });

  router.post('/auth/register', authController.register);
  router.get('/auth/google', authController.google);
  router.get('/auth/google/callback', authController.googleCallback);
  router.post('/auth/login', authController.login);
  router.post('/auth/refresh', refreshController);
  router.post('/auth/logout', logoutController);

  router.get('/auth/validate', async (request, response, next) => {
    try {
      const payload = validateAuthorizationHeader(request.header('authorization'), config);

      response.json({
        payload,
      });
    } catch (error: unknown) {
      if (error instanceof RouteError) {
        sendRouteErrorResponse(response, error);

        return;
      }

      next(error);
    }
  });

  return router;
};
