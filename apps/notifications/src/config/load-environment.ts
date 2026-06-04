import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';

let environmentLoaded = false;

export const loadEnvironment = (): void => {
  if (environmentLoaded) {
    return;
  }

  const appRootPath = resolve(__dirname, '..', '..');
  const repositoryRootPath = resolve(appRootPath, '..', '..');

  loadDotenv({ path: resolve(repositoryRootPath, '.env') });
  loadDotenv({ override: true, path: resolve(appRootPath, '.env') });

  environmentLoaded = true;
};

loadEnvironment();
