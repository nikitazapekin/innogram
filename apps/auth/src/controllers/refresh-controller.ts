import type { RequestHandler } from 'express';

import type { AppConfig } from '../config/app-config';
import { buildAuthResponse } from '../services/auth-response-service';
import type { RefreshSessionService } from '../services/refresh-session-service';
import {
  resolveRefreshToken,
  setRefreshTokenCookie,
} from '../services/refresh-token-cookie-service';
import { RouteError } from '../shared/route-error';
import { sendRouteErrorResponse } from './route-error-response';

type CreateRefreshControllerOptions = Readonly<{
  config: AppConfig;
  refreshSessionService: RefreshSessionService;
}>;

export const createRefreshController = ({
  config,
  refreshSessionService,
}: CreateRefreshControllerOptions): RequestHandler => {
  const refresh: RequestHandler = async (request, response, next) => {
    try {
      const refreshToken = resolveRefreshToken(request);
      const refreshSession = await refreshSessionService.rotateSession(refreshToken);

      setRefreshTokenCookie(response, refreshSession.refreshToken);
      response.json(buildAuthResponse(refreshSession.email, config));
    } catch (error: unknown) {
      if (error instanceof RouteError) {
        sendRouteErrorResponse(response, error);

        return;
      }

      next(error);
    }
  };

  return refresh;
};
