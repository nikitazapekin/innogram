import { Router } from 'express';

import { createAuthController } from '../controllers/auth-controller';
import { createLogoutController } from '../controllers/logout-controller';
import { createRefreshController } from '../controllers/refresh-controller';
import type { AppConfig } from '../config/app-config';
import type { RefreshSessionService } from '../services/refresh-session-service';

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

  router.post('/auth/register', authController.register);
  router.get('/auth/google', authController.google);
  router.get('/auth/google/callback', authController.googleCallback);
  router.post('/auth/login', authController.login);
  router.post('/auth/refresh', refreshController);
  router.post('/auth/logout', logoutController);

  return router;
};
