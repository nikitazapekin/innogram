import { Router } from 'express';

import type { AuthCoreProducer } from '../kafka/auth-core-producer';

type CreateAuthRouterOptions = Readonly<{
  authCoreProducer: AuthCoreProducer;
}>;

export const createAuthRouter = ({ authCoreProducer }: CreateAuthRouterOptions): Router => {
  const router = Router();

  router.post('/kafka/signup', async (_request, response, next) => {
    try {
      await authCoreProducer.sendSignupMessage();

      response.status(202).json({
        status: 'sent',
      });
    } catch (error: unknown) {
      next(error);
    }
  });

  return router;
};
