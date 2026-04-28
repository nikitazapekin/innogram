import { Router } from 'express';

export const createSystemRouter = (): Router => {
  const router = Router();

  router.get('/', (_request, response) => {
    response.status(200).json({
      message: 'Authentication microservice is running.',
    });
  });

  router.get('/health', (_request, response) => {
    response.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  return router;
};
