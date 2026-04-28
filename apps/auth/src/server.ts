import express, { type RequestHandler } from 'express';
import cors from 'cors';

import { AuthService } from './auth-service';
import { createAuthRouter } from './auth-routes';
import { loadConfig } from './config';
import { CoreClient } from './core-client';
import { errorHandler } from './errors';
import { GoogleOAuthService } from './google-oauth';

async function bootstrap(): Promise<void> {
  const config = loadConfig();

  const authService = new AuthService(
    config,
    new CoreClient(config.coreServiceUrl, config.coreServiceTimeoutMs),
    new GoogleOAuthService(
      config.googleClientId,
      config.googleClientSecret,
      config.googleCallbackUrl,
    ),
  );

  const app = express();

  app.disable('x-powered-by');
  app.use(
    express.json({
      limit: '16kb',
    }),
  );

  if (config.clientOrigin) {
    app.use(
      cors({
        origin: [config.clientOrigin],
        credentials: true,
      }) as RequestHandler,
    );
  }

  app.use((_request, response, next) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('X-DNS-Prefetch-Control', 'off');
    next();
  });

  app.use('/auth', createAuthRouter(authService));
  app.use(errorHandler);

  const server = app.listen(config.port, () => {
    console.log(`Auth microservice started on port ${config.port}`);
  });

  let isShuttingDown = false;

  const shutdown = (): void => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;

    server.close(async (error) => {
      if (error) {
        console.error('Failed to stop auth microservice', error);
        process.exitCode = 1;
      }

      process.exit();
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

void bootstrap().catch((error) => {
  console.error('Failed to start auth microservice', error);
  process.exit(1);
});
