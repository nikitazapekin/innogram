import { RouteError } from '../shared/route-error';

type GoogleCallbackRequest = Readonly<{
  headers: Record<string, string | string[] | undefined>;
  protocol: string;
}>;

export const getGoogleCallbackUrl = (request: GoogleCallbackRequest): string => {
  const forwardedProtoHeader = request.headers['x-forwarded-proto'];
  const forwardedHostHeader = request.headers['x-forwarded-host'];
  const hostHeader = request.headers.host;
  let protocol = request.protocol;

  if (typeof forwardedProtoHeader === 'string' && forwardedProtoHeader.trim().length > 0) {
    protocol = forwardedProtoHeader.split(',')[0]?.trim() ?? request.protocol;
  }

  let host = '';

  if (typeof forwardedHostHeader === 'string' && forwardedHostHeader.trim().length > 0) {
    host = forwardedHostHeader.split(',')[0]?.trim() ?? '';
  } else if (typeof hostHeader === 'string') {
    host = hostHeader.trim();
  }

  if (!host) {
    throw new RouteError(
      400,
      'GOOGLE_OAUTH_HOST_MISSING',
      'Google OAuth request did not contain a valid host header.',
    );
  }

  return `${protocol}://${host}/auth/google/callback`;
};
