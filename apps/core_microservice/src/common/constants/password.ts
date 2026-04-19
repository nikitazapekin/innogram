export const PASSWORD_HASH_ALGORITHM = 'scrypt';
export const PASSWORD_HASH_VERSION = 1;

export const PASSWORD_SALT_LENGTH = 16;
export const PASSWORD_KEY_LENGTH = 64;

export const PASSWORD_SCRYPT_PARAMS = {
  N: 16384,
  r: 8,
  p: 1,
} as const;
