import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { parse as parseYaml } from 'yaml';

const SWAGGER_PATH = process.env.AUTH_SWAGGER_PATH ?? 'api/docs';

export const registerSwagger = (app: Express): void => {
  const specPath = resolve(__dirname, 'openapi.yaml');
  const spec = parseYaml(readFileSync(specPath, 'utf8'));

  app.use(`/${SWAGGER_PATH}`, swaggerUi.serve, swaggerUi.setup(spec));
};
