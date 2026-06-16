import { createPublicKey } from 'node:crypto';
import {
  Inject,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';

import { SHARED_AUTH_OPTIONS } from './auth-config';
import type { SharedAuthOptions } from './auth-config';

type JsonWebKeyLike = Readonly<{
  alg: 'RS256';
  e: string;
  kid: string;
  kty: 'RSA';
  n: string;
  use: 'sig';
}>;

type JwksResponse = Readonly<{
  keys?: unknown;
}>;

const DEFAULT_JWKS_CACHE_TTL_MS = 5 * 60 * 1000;

const normalizeServiceUrl = (value: string): string => value.replace(/\/+$/, '');

const isJsonWebKeyLike = (value: unknown): value is JsonWebKeyLike =>
  typeof value === 'object' &&
  value !== null &&
  'alg' in value &&
  value.alg === 'RS256' &&
  'e' in value &&
  typeof value.e === 'string' &&
  'kid' in value &&
  typeof value.kid === 'string' &&
  'kty' in value &&
  value.kty === 'RSA' &&
  'n' in value &&
  typeof value.n === 'string' &&
  'use' in value &&
  value.use === 'sig';

const toJwksResponse = (value: unknown): JwksResponse | null => {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  if (!('keys' in value)) {
    return null;
  }

  return {
    keys: value.keys,
  };
};

@Injectable()
export class SharedJwksClientService {
  private cachedKeys = new Map<string, string>();
  private cacheExpiresAt = 0;
  private pendingRefresh: Promise<void> | null = null;

  public constructor(
    @Inject(SHARED_AUTH_OPTIONS)
    private readonly options: SharedAuthOptions,
  ) {}

  public async getPublicKey(kid: string): Promise<string> {
    if (this.isCacheStale()) {
      await this.refreshKeys();
    }

    const cachedKey = this.cachedKeys.get(kid);

    if (cachedKey) {
      return cachedKey;
    }

    await this.refreshKeys();

    const refreshedKey = this.cachedKeys.get(kid);

    if (!refreshedKey) {
      throw new UnauthorizedException('JWT signing key was not found.');
    }

    return refreshedKey;
  }

  private isCacheStale(): boolean {
    return this.cachedKeys.size === 0 || Date.now() >= this.cacheExpiresAt;
  }

  private async refreshKeys(): Promise<void> {
    if (!this.pendingRefresh) {
      this.pendingRefresh = this.loadKeys().finally(() => {
        this.pendingRefresh = null;
      });
    }

    await this.pendingRefresh;
  }

  private async loadKeys(): Promise<void> {
    let response: Response;

    try {
      response = await fetch(
        `${normalizeServiceUrl(this.options.authServiceUrl)}/.well-known/jwks.json`,
      );
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new ServiceUnavailableException(error.message);
      }

      throw new ServiceUnavailableException('JWKS endpoint is unavailable.');
    }

    if (!response.ok) {
      throw new ServiceUnavailableException(`JWKS endpoint returned ${response.status}.`);
    }

    const responseJson = await response.json().catch(() => null);
    const jwksResponse = toJwksResponse(responseJson);

    if (!jwksResponse || !Array.isArray(jwksResponse.keys)) {
      throw new ServiceUnavailableException('JWKS response has invalid shape.');
    }

    const nextKeys = new Map<string, string>();

    for (const key of jwksResponse.keys) {
      if (!isJsonWebKeyLike(key)) {
        continue;
      }

      const publicKey = createPublicKey({
        format: 'jwk',
        key: {
          alg: key.alg,
          e: key.e,
          kty: key.kty,
          n: key.n,
          use: key.use,
        },
      });

      nextKeys.set(key.kid, publicKey.export({ format: 'pem', type: 'spki' }).toString());
    }

    if (nextKeys.size === 0) {
      throw new ServiceUnavailableException('JWKS response does not contain signing keys.');
    }

    this.cachedKeys = nextKeys;
    this.cacheExpiresAt = Date.now() + (this.options.jwksCacheTtlMs ?? DEFAULT_JWKS_CACHE_TTL_MS);
  }
}
