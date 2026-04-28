import { randomUUID } from 'node:crypto';

import bcrypt from 'bcrypt';
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';

import type { AppConfig, JwtDuration } from './config';
import { CoreClient, type CoreUser } from './core-client';
import { HttpError } from './errors';
import { GoogleOAuthService } from './google-oauth';

type AuthProvider = 'password' | 'google';

type TokenType = 'access' | 'refresh';

interface TokenPayload extends JwtPayload {
  sub: string;
  sid: string;
  email: string;
  typ: TokenType;
}

interface IssueTokensInput {
  sessionId: string;
  userId: number;
  email: string;
  provider?: AuthProvider;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

export interface AuthResponse extends AuthTokens {
  user: {
    id: number;
    email: string;
  };
}

export interface LogoutInput {
  accessToken?: string;
  refreshToken?: string;
}

export interface AccessTokenValidationResult {
  userId: number;
  email: string;
  sessionId: string;
}

export class AuthService {
  constructor(
    private readonly config: AppConfig,
    private readonly coreClient: CoreClient,
    private readonly googleOAuthService: GoogleOAuthService,
  ) {}

  async register(email: string, password: string): Promise<AuthResponse> {
    const normalizedEmail = normalizeEmail(email);

    validatePassword(password);

    const existingUser = await this.coreClient.findUserByEmail(normalizedEmail);

    if (existingUser) {
      throw new HttpError(409, 'User with this email already exists.', 'USER_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, this.config.bcryptSaltRounds);
    const user = await this.coreClient.createPasswordUser({
      email: normalizedEmail,
      passwordHash,
    });

    return this.createAuthResponse(user, 'password');
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const normalizedEmail = normalizeEmail(email);
    const user = await this.coreClient.findUserByEmail(normalizedEmail);

    if (!user?.passwordHash) {
      throw new HttpError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new HttpError(401, 'Invalid email or password.', 'INVALID_CREDENTIALS');
    }

    return this.createAuthResponse(user, 'password');
  }

  createGoogleAuthorizationUrl(redirectUri?: string): string {
    return this.googleOAuthService.createAuthorizationUrl(redirectUri);
  }

  async loginWithGoogle(code: string, redirectUri?: string): Promise<AuthResponse> {
    const profile = await this.googleOAuthService.exchangeCode(code, redirectUri);
    const passwordHash = await bcrypt.hash(randomUUID(), this.config.bcryptSaltRounds);
    const user = await this.coreClient.upsertOAuthUser({
      email: profile.email,
      passwordHash,
    });

    return this.createAuthResponse(user, 'google');
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = this.verifyToken(refreshToken, 'refresh');

    return this.issueTokens({
      sessionId: payload.sid,
      userId: Number(payload.sub),
      email: payload.email,
    });
  }

  async logout(input: LogoutInput): Promise<void> {
    const token = input.refreshToken?.trim() || input.accessToken?.trim();

    if (!token) {
      throw new HttpError(
        400,
        'Access token or refresh token is required to logout.',
        'TOKEN_REQUIRED',
      );
    }

    const tokenType: TokenType = input.refreshToken ? 'refresh' : 'access';

    this.verifyToken(token, tokenType);
  }

  async validateAccessToken(accessToken: string): Promise<AccessTokenValidationResult> {
    const payload = this.verifyToken(accessToken, 'access');

    return {
      userId: Number(payload.sub),
      email: payload.email,
      sessionId: payload.sid,
    };
  }

  private async createAuthResponse(user: CoreUser, provider: AuthProvider): Promise<AuthResponse> {
    const tokens = await this.issueTokens({
      sessionId: randomUUID(),
      userId: user.id,
      email: user.email,
      provider,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }

  private async issueTokens(input: IssueTokensInput): Promise<AuthTokens> {
    const accessToken = this.signToken(
      {
        sub: String(input.userId),
        sid: input.sessionId,
        email: input.email,
        typ: 'access',
      },
      this.config.jwtAccessSecret,
      this.config.jwtAccessTtl,
    );
    const refreshToken = this.signToken(
      {
        sub: String(input.userId),
        sid: input.sessionId,
        email: input.email,
        typ: 'refresh',
      },
      this.config.jwtRefreshSecret,
      this.config.jwtRefreshTtl,
    );

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: this.config.jwtAccessTtlSeconds,
      refreshTokenExpiresIn: this.config.jwtRefreshTtlSeconds,
    };
  }

  private signToken(payload: TokenPayload, secret: string, expiresIn: JwtDuration): string {
    const options: SignOptions = {
      algorithm: 'HS256',
      expiresIn,
    };

    return jwt.sign(payload, secret, options);
  }

  private verifyToken(token: string, expectedType: TokenType): TokenPayload {
    try {
      const payload = jwt.verify(
        token,
        expectedType === 'access' ? this.config.jwtAccessSecret : this.config.jwtRefreshSecret,
      );

      if (!payload || typeof payload !== 'object') {
        throw new HttpError(401, 'Token payload is invalid.', 'INVALID_TOKEN');
      }

      const validatedPayload = payload as Partial<TokenPayload>;

      if (
        validatedPayload.typ !== expectedType ||
        typeof validatedPayload.sub !== 'string' ||
        typeof validatedPayload.sid !== 'string' ||
        typeof validatedPayload.email !== 'string'
      ) {
        throw new HttpError(401, 'Token payload is invalid.', 'INVALID_TOKEN');
      }

      return validatedPayload as TokenPayload;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error;
      }

      throw new HttpError(401, 'Token is invalid or expired.', 'INVALID_TOKEN');
    }
  }
}

function normalizeEmail(email: string): string {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new HttpError(400, 'Email is invalid.', 'INVALID_EMAIL');
  }

  return normalizedEmail;
}

function validatePassword(password: string): void {
  if (password.length < 8) {
    throw new HttpError(400, 'Password must contain at least 8 characters.', 'INVALID_PASSWORD');
  }

  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw new HttpError(400, 'Password must contain at most 72 bytes.', 'INVALID_PASSWORD');
  }
}
