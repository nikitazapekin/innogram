import {
  HttpException,
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';

import type { AuthenticatedAccessTokenPayload } from './types';

export type SharedAuthClientOptions = Readonly<{
  authServiceUrl: string;
}>;

export const SHARED_AUTH_CLIENT_OPTIONS = Symbol('SHARED_AUTH_CLIENT_OPTIONS');

type ValidateTokenResponseBody = Readonly<{
  payload?: unknown;
  message?: string;
}>;

const normalizeServiceUrl = (value: string): string => value.replace(/\/+$/, '');

const isAuthenticatedAccessTokenPayload = (
  value: unknown,
): value is AuthenticatedAccessTokenPayload =>
  typeof value === 'object' &&
  value !== null &&
  'email' in value &&
  'exp' in value &&
  'iat' in value &&
  'sub' in value &&
  'tokenType' in value &&
  value.tokenType === 'access';

const toValidateTokenResponseBody = (value: unknown): ValidateTokenResponseBody | null => {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  let payload: unknown;

  if ('payload' in value) {
    payload = value.payload;
  }

  let message: string | undefined;

  if ('message' in value && typeof value.message === 'string') {
    message = value.message;
  }

  if (payload === undefined && message === undefined) {
    return null;
  }

  return {
    payload,
    message,
  };
};

@Injectable()
export class SharedAuthClientService {
  public constructor(
    @Inject(SHARED_AUTH_CLIENT_OPTIONS)
    private readonly options: SharedAuthClientOptions,
  ) {}

  public async validateAccessToken(token: string): Promise<AuthenticatedAccessTokenPayload> {
    let response: Response;

    try {
      response = await fetch(`${normalizeServiceUrl(this.options.authServiceUrl)}/auth/validate`, {
        method: 'GET',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ServiceUnavailableException(error.message);
      }

      throw new ServiceUnavailableException('Auth service is unavailable.');
    }

    const responseJson = await response.json().catch(() => null);
    const responseBody = toValidateTokenResponseBody(responseJson);

    if (response.ok && isAuthenticatedAccessTokenPayload(responseBody?.payload)) {
      return responseBody.payload;
    }

    let message = 'Token validation failed.';

    if (responseBody?.message !== undefined) {
      message = responseBody.message;
    }

    if (response.status === 401) {
      throw new UnauthorizedException(message);
    }

    throw new HttpException(message, response.status);
  }
}
