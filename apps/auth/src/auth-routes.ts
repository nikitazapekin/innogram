import { Router, type Request } from 'express';

import { AuthService } from './auth-service';
import { HttpError, asyncHandler } from './errors';

interface ReadStringOptions {
  trim?: boolean;
}

export function createAuthRouter(authService: AuthService): Router {
  const router = Router();

  router.post(
    '/register',
    asyncHandler(async (request, response) => {
      const body = readBody(request);
      const result = await authService.register(
        readRequiredString(body, 'email'),
        readRequiredString(body, 'password', { trim: false }),
      );

      response.status(201).json(result);
    }),
  );

  router.post(
    '/login',
    asyncHandler(async (request, response) => {
      const body = readBody(request);
      const result = await authService.login(
        readRequiredString(body, 'email'),
        readRequiredString(body, 'password', { trim: false }),
      );

      response.status(200).json(result);
    }),
  );

  router.get(
    '/google/url',
    asyncHandler(async (request, response) => {
      const redirectUri = readOptionalQueryString(request, 'redirectUri');

      response.status(200).json({
        url: authService.createGoogleAuthorizationUrl(redirectUri),
      });
    }),
  );

  router.post(
    '/google/exchange',
    asyncHandler(async (request, response) => {
      const body = readBody(request);
      const result = await authService.loginWithGoogle(
        readRequiredString(body, 'code'),
        readOptionalString(body, 'redirectUri'),
      );

      response.status(200).json(result);
    }),
  );

  router.post(
    '/refresh',
    asyncHandler(async (request, response) => {
      const body = readBody(request);
      const result = await authService.refresh(readRequiredString(body, 'refreshToken'));

      response.status(200).json(result);
    }),
  );

  router.post(
    '/logout',
    asyncHandler(async (request, response) => {
      const body = readBody(request);

      await authService.logout({
        accessToken: readBearerToken(request),
        refreshToken: readOptionalString(body, 'refreshToken'),
      });

      response.status(204).send();
    }),
  );

  router.post(
    '/validate',
    asyncHandler(async (request, response) => {
      const body = readBody(request);
      const result = await authService.validateAccessToken(readRequiredString(body, 'accessToken'));

      response.status(200).json(result);
    }),
  );

  return router;
}

function readBody(request: Request): Record<string, unknown> {
  if (request.body === undefined) {
    return {};
  }

  if (typeof request.body !== 'object' || Array.isArray(request.body) || request.body === null) {
    throw new HttpError(400, 'Request body must be a JSON object.', 'INVALID_REQUEST_BODY');
  }

  return request.body as Record<string, unknown>;
}

function readRequiredString(
  body: Record<string, unknown>,
  key: string,
  options: ReadStringOptions = {},
): string {
  const value = body[key];

  if (typeof value !== 'string') {
    throw new HttpError(400, `Field "${key}" is required.`, 'INVALID_REQUEST_BODY');
  }

  if (options.trim === false) {
    if (value.length === 0) {
      throw new HttpError(400, `Field "${key}" is required.`, 'INVALID_REQUEST_BODY');
    }

    return value;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new HttpError(400, `Field "${key}" is required.`, 'INVALID_REQUEST_BODY');
  }

  return normalizedValue;
}

function readOptionalString(
  body: Record<string, unknown>,
  key: string,
  options: ReadStringOptions = {},
): string | undefined {
  const value = body[key];

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new HttpError(400, `Field "${key}" must be a non-empty string.`, 'INVALID_REQUEST_BODY');
  }

  if (options.trim === false) {
    if (value.length === 0) {
      throw new HttpError(
        400,
        `Field "${key}" must be a non-empty string.`,
        'INVALID_REQUEST_BODY',
      );
    }

    return value;
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new HttpError(400, `Field "${key}" must be a non-empty string.`, 'INVALID_REQUEST_BODY');
  }

  return normalizedValue;
}

function readOptionalQueryString(request: Request, key: string): string | undefined {
  const value = request.query[key];

  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'string' || !value.trim()) {
    throw new HttpError(
      400,
      `Query parameter "${key}" must be a non-empty string.`,
      'INVALID_QUERY',
    );
  }

  return value.trim();
}

function readBearerToken(request: Request): string | undefined {
  const authorizationHeader = request.header('authorization');

  if (!authorizationHeader) {
    return undefined;
  }

  const parts = authorizationHeader.trim().split(/\s+/);

  if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
    throw new HttpError(400, 'Authorization header must contain a Bearer token.', 'INVALID_TOKEN');
  }

  return parts[1];
}
