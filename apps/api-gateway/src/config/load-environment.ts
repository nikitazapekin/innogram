import { resolve } from 'node:path';

import { loadMonorepoEnvironment } from '@innogram/shared';

export const loadEnvironment = (): void => {
  loadMonorepoEnvironment(resolve(__dirname, '..', '..'));
};
