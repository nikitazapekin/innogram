import type { AppConfig } from '../config/app-config';
import {
  createAccessToken,
  createRefreshToken,
  validateAccessToken,
  validateRefreshToken,
} from './token-service';

export const buildAuthResponse = (
  email: string,
  config: AppConfig,
): Readonly<{ accessToken: string; email: string; refreshToken: string }> => {
  const accessToken = createAccessToken(
    email,
    config.accessTokenSecret,
    config.accessTokenExpiresIn,
  );
  const refreshToken = createRefreshToken(
    email,
    config.refreshTokenSecret,
    config.refreshTokenExpiresIn,
  );

  validateAccessToken(accessToken, config.accessTokenSecret);
  validateRefreshToken(refreshToken, config.refreshTokenSecret);

  return {
    accessToken,
    email,
    refreshToken,
  };
};
