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
  const formattedEmail = email.trim().toLowerCase();
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
