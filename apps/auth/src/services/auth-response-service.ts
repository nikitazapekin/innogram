import type { AppConfig } from '../config/app-config';
import { createAccessToken, validateAccessToken } from './token-service';

export const buildAuthResponse = (
  email: string,
  config: AppConfig,
): Readonly<{ accessToken: string; email: string }> => {
  const accessToken = createAccessToken(
    email,
    config.accessTokenSecret,
    config.accessTokenExpiresIn,
  );

  validateAccessToken(accessToken, config.accessTokenSecret);

  return {
    accessToken,
    email,
  };
};
