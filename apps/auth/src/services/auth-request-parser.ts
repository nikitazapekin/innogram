import { createRouteError } from '../shared/route-error';

const ensureBodyRecord = (body: unknown): Record<string, unknown> => {
  if (typeof body !== 'object' || body === null) {
    throw createRouteError(400, 'INVALID_REQUEST', 'Request body must be an object.');
  }

  return { ...body };
};

const getRecordValue = (record: Record<string, unknown>, key: string): unknown => record[key];

const ensureNonEmptyString = (value: unknown, code: string, field: string): string => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw createRouteError(400, code, `Field "${field}" must be a non-empty string.`);
  }

  return value;
};

export const parseRegisterRequestBody = (
  body: unknown,
): Readonly<{ email: string; password: string }> => {
  const requestBody = ensureBodyRecord(body);
  const email = ensureNonEmptyString(
    getRecordValue(requestBody, 'email'),
    'INVALID_EMAIL',
    'email',
  );
  const password = ensureNonEmptyString(
    getRecordValue(requestBody, 'password'),
    'INVALID_PASSWORD',
    'password',
  );
  const formattedEmail = email.toLowerCase();

  return {
    email: formattedEmail,
    password,
  };
};

export const parseLoginRequestBody = (
  body: unknown,
): Readonly<{ email: string; password: string }> => {
  const requestBody = ensureBodyRecord(body);
  const email = ensureNonEmptyString(
    getRecordValue(requestBody, 'email'),
    'INVALID_EMAIL',
    'email',
  );
  const password = ensureNonEmptyString(
    getRecordValue(requestBody, 'password'),
    'INVALID_PASSWORD',
    'password',
  );
  const formattedEmail = email.trim().toLowerCase();

  return {
    email: formattedEmail,
    password,
  };
};

export const parseRefreshTokenRequestBody = (body: unknown): Readonly<{ refreshToken: string }> => {
  const requestBody = ensureBodyRecord(body);
  const refreshToken = ensureNonEmptyString(
    getRecordValue(requestBody, 'refreshToken'),
    'INVALID_REFRESH_TOKEN',
    'refreshToken',
  );

  return {
    refreshToken: refreshToken.trim(),
  };
};

export const parseRefreshTokenCookie = (
  cookieHeader: string | undefined,
): Readonly<{ refreshToken: string }> => {
  if (typeof cookieHeader !== 'string' || cookieHeader.trim().length === 0) {
    throw createRouteError(
      401,
      'MISSING_REFRESH_TOKEN_COOKIE',
      'Refresh token cookie is required.',
    );
  }

  const cookieEntries = cookieHeader.split(';');

  for (const cookieEntry of cookieEntries) {
    const [rawName, ...rawValueParts] = cookieEntry.split('=');

    if (rawName?.trim() !== 'refreshToken') {
      continue;
    }

    const rawValue = rawValueParts.join('=').trim();

    if (rawValue.length === 0) {
      break;
    }

    return {
      refreshToken: decodeURIComponent(rawValue),
    };
  }

  throw createRouteError(401, 'MISSING_REFRESH_TOKEN_COOKIE', 'Refresh token cookie is required.');
};
