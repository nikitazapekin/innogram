import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

let environmentLoaded = false;

const loadIfExists = (path: string, override: boolean): void => {
  if (existsSync(path)) {
    loadDotenv({ path, override });
  }
};

export const loadMonorepoEnvironment = (appRootPath: string): void => {
  if (environmentLoaded) {
    return;
  }

  const repositoryRootPath = resolve(appRootPath, '..', '..');
  const nodeEnv = process.env.NODE_ENV ?? 'development';

  loadIfExists(resolve(repositoryRootPath, '.env'), false);
  loadIfExists(resolve(repositoryRootPath, `.env.${nodeEnv}`), true);
  loadIfExists(resolve(appRootPath, '.env'), true);
  loadIfExists(resolve(appRootPath, `.env.${nodeEnv}`), true);

  environmentLoaded = true;
};
