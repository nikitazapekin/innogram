export const DEFAULT_DISPLAY_NAME = '';
export const DEFAULT_BIO: string | null = null;
export const DEFAULT_AVATAR_ASSET_ID: number | null = null;

export const USER_ERROR_MESSAGES = {
  REQUIRED_FIELDS: 'email and password are required.',
  USER_NOT_FOUND: 'User was not found.',
  PROFILE_NOT_FOUND: 'User profile was not found.',
} as const;

export const USER_LOG_MESSAGES = {
  CREATED: 'User created',
  UPDATED: 'User updated',
  FULLY_UPDATED: 'User fully updated',
  DELETED: 'User deleted',
} as const;

export const USERS_FIND_OPTIONS = {
  relations: { profiles: true },
  order: { createdAt: 'DESC' },
} as const;
