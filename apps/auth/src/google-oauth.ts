import { OAuth2Client } from 'google-auth-library';

import { HttpError } from './errors';

export interface GoogleOAuthProfile {
  email: string;
  providerAccountId: string;
}

export class GoogleOAuthService {
  constructor(
    private readonly clientId: string,
    private readonly clientSecret: string,
    private readonly callbackUrl: string,
  ) {}

  createAuthorizationUrl(redirectUri?: string): string {
    const client = this.createClient(redirectUri);

    return client.generateAuthUrl({
      access_type: 'offline',
      include_granted_scopes: true,
      prompt: 'consent',
      scope: ['openid', 'email', 'profile'],
    });
  }

  async exchangeCode(code: string, redirectUri?: string): Promise<GoogleOAuthProfile> {
    try {
      const client = this.createClient(redirectUri);
      const { tokens } = await client.getToken(code);

      if (!tokens.id_token) {
        throw new HttpError(
          401,
          'Google response does not contain an ID token.',
          'GOOGLE_OAUTH_ERROR',
        );
      }

      const ticket = await client.verifyIdToken({
        idToken: tokens.id_token,
        audience: this.clientId,
      });
      const payload = ticket.getPayload();
      const email = payload?.email?.trim().toLowerCase();
      const providerAccountId = payload?.sub?.trim();

      if (!payload?.email_verified || !email || !providerAccountId) {
        throw new HttpError(401, 'Google account email is not verified.', 'GOOGLE_OAUTH_ERROR');
      }

      return {
        email,
        providerAccountId,
      };
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      throw new HttpError(401, 'Google OAuth authentication failed.', 'GOOGLE_OAUTH_ERROR');
    }
  }

  private createClient(redirectUri?: string): OAuth2Client {
    return new OAuth2Client({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: redirectUri?.trim() || this.callbackUrl,
    });
  }
}
