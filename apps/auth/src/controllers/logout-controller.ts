import type { RequestHandler } from 'express';

import type { RefreshSessionService } from '../services/refresh-session-service';
import {
  clearRefreshTokenCookie,
  resolveRefreshToken,
} from '../services/refresh-token-cookie-service';
import { RouteError } from '../shared/route-error';
import { sendRouteErrorResponse } from './route-error-response';

type CreateLogoutControllerOptions = Readonly<{
  refreshSessionService: RefreshSessionService;
}>;

export const createLogoutController = ({
  refreshSessionService,
}: CreateLogoutControllerOptions): RequestHandler => {
  const logout: RequestHandler = async (request, response, next) => {
    try {
      const refreshToken = resolveRefreshToken(request);

      await refreshSessionService.deleteSession(refreshToken);

      clearRefreshTokenCookie(response);
      response.status(204).send();
    } catch (error: unknown) {
      if (error instanceof RouteError) {
        sendRouteErrorResponse(response, error);

        return;
      }

      next(error);
    }
  };

  return logout;
};
