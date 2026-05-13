import { Router } from 'express';
import axios from 'axios';

import type { AppConfig } from '../config/app-config';
import { parseLoginRequestBody, parseRegisterRequestBody } from '../services/auth-request-parser';
import { buildAuthResponse } from '../services/auth-response-service';
import { hashPassword } from '../services/password-service';

import { createRouteError, RouteError } from '../shared/route-error';

type CreateAuthRouterOptions = Readonly<{
  config: AppConfig;
}>;

type AuthUser = Readonly<{
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
}>;

const CORE_AUTH_URL = process.env.AUTH_CORE_HTTP_URL?.trim() || 'http://localhost:3001';

export const createAuthRouter = ({ config }: CreateAuthRouterOptions): Router => {
  const router = Router();

  router.post('/auth/register', async (request, response, next) => {
    try {
      const { email, password } = parseRegisterRequestBody(request.body);
      const passwordHash = await hashPassword(password, config);

      await axios.post<AuthUser>(`${CORE_AUTH_URL}/auth/user`, {
        email,
        passwordHash,
      });

      response.status(201).json(buildAuthResponse(email, config));
    } catch (error: unknown) {
      if (error instanceof RouteError) {
        response.status(error.status).json({
          error: error.code,
          message: error.message,
        });

        return;
      }

      if (axios.isAxiosError(error) && error.response?.status === 409) {
        response.status(409).json({
          error: 'USER_ALREADY_EXISTS',
          message: 'User already exists',
        });

        return;
      }

      next(error);
    }
  });

  router.post('/auth/login', async (request, response, next) => {
    try {
      const { email, password } = parseLoginRequestBody(request.body);
      const { data: user } = await axios.post<AuthUser | null>(
        `${CORE_AUTH_URL}/auth/user/verify`,
        {
          email,
          password,
        },
      );

      if (!user) {
        throw createRouteError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
      }

      response.json(buildAuthResponse(user.email, config));
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
