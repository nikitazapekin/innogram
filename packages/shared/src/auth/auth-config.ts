export type SharedAuthOptions = Readonly<{
  authServiceUrl: string;
  jwksCacheTtlMs?: number;
}>;

export const SHARED_AUTH_OPTIONS = Symbol('SHARED_AUTH_OPTIONS');
