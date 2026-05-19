import type { AppConfig } from '../config/app-config';
import {
  createAccessToken,
  getAccessTokenPublicKeyPem,
  validateAccessToken,
} from './token-service';

export type AuthResponse = Readonly<{
  accessToken: string;
  email: string;
}>;

export const buildAuthResponse = (email: string, config: AppConfig): AuthResponse => {
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
