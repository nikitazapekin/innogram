import type { AppConfig } from '../config/app-config';
import {
  createAccessToken,
  getAccessTokenPublicKeyPem,
  validateAccessToken,
} from './token-service';

export const buildAuthResponse = (
  email: string,
  config: AppConfig,
): Readonly<{ accessToken: string; email: string }> => {
  const accessToken = createAccessToken(
    email,
    config.accessTokenPrivateKey,
    config.accessTokenExpiresIn,
    config.accessTokenKeyId,
  );

  validateAccessToken(accessToken, getAccessTokenPublicKeyPem(config.accessTokenPrivateKey));

  return {
    accessToken,
    email,
  };
};
