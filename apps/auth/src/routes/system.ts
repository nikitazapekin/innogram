import { Router } from 'express';

export const createSystemRouter = (): Router => {
  const router = Router();

  router.get('/', (_request, response) => {
    response.json({
      message: 'Authentication microservice is running.',
    });
  });

  router.get('/health', (_request, response) => {
    response.json({
      status: 'ok',
      timestamp: new Date(),
    });
  });

  return router;
};
