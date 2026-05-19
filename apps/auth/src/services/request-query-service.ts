import { createRouteError } from '../shared/route-error';

export const getRequiredQueryParam = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw createRouteError(400, 'INVALID_REQUEST', `Query parameter "${field}" is required.`);
  }

  return value;
};

export const getOptionalQueryParam = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  return value;
};
