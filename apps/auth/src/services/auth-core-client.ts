import axios from 'axios';

export type AuthUser = Readonly<{
  id: number;
  email: string;
  createdAt: string;
  updatedAt: string;
}>;

type CreateUserOptions = Readonly<{
  displayName: string;
  email: string;
  googleId?: string;
  passwordHash?: string | null;
  provider: 'local' | 'google';
}>;

const CORE_AUTH_URL = process.env.AUTH_CORE_HTTP_URL || 'http://localhost:3001';
const CORE_USERS_URL = process.env.AUTH_CORE_USERS_HTTP_URL || CORE_AUTH_URL;

const normalizeDisplayName = (displayName: string): string => {
  if (displayName.length === 0) {
    return 'user';
  }

  return displayName;
};

const createProfile = async (displayName: string): Promise<void> => {
  await axios.post(`${CORE_USERS_URL}/users`, {
    displayName: normalizeDisplayName(displayName),
  });
};

export const createUserAndProfile = async (options: CreateUserOptions): Promise<AuthUser> => {
  const { data: user } = await axios.post<AuthUser>(`${CORE_AUTH_URL}/auth/user`, {
    email: options.email,
    googleId: options.googleId ?? null,
    passwordHash: options.passwordHash ?? null,
    provider: options.provider,
  });

  await createProfile(options.displayName);

  return user;
};

export const findUserByEmail = async (email: string): Promise<AuthUser | null> => {
  const { data } = await axios.get<AuthUser | null>(`${CORE_AUTH_URL}/auth/user`, {
    params: {
      email,
    },
  });

  return data;
};

export const verifyUserCredentials = async (
  email: string,
  password: string,
): Promise<AuthUser | null> => {
  const { data } = await axios.post<AuthUser | null>(`${CORE_AUTH_URL}/auth/user/verify`, {
    email,
    password,
  });

  return data;
};
