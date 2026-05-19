type RequestHeadersWithAuthorization = {
  authorization?: string | string[];
};

export type AuthenticatedAccessTokenPayload = Readonly<{
  email: string;
  exp: number;
  iat: number;
  sub: string;
  tokenType: 'access';
}>;

export type AuthenticatedRequest = {
  auth?: AuthenticatedAccessTokenPayload;
  headers: RequestHeadersWithAuthorization;
  user?: AuthenticatedAccessTokenPayload;
};
