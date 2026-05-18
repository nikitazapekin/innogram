import type { AppConfig } from '../config/app-config';
import { createAccessToken, validateAccessToken } from './token-service';

export type AuthResponse = Readonly<{
  accessToken: string;
  email: string;
}>;

export const buildAuthResponse = (email: string, config: AppConfig): AuthResponse => {
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
