import type { User } from '@/app/entities/user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL!;

const guestUser: User = { id: 0, displayName: 'Гость', email: '' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseEmailFromTokenPayload(value: unknown): string | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const { email } = value;

  return typeof email === 'string' ? email : undefined;
}

function decodeEmailFromToken(token: string): string | undefined {
  try {
    const tokenPart = token.split('.')[1];

    if (!tokenPart) {
      return undefined;
    }

    const payload: unknown = JSON.parse(Buffer.from(tokenPart, 'base64url').toString());

    return parseEmailFromTokenPayload(payload);
  } catch {
    return undefined;
  }
}

function parseUser(value: unknown): User | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const { id, displayName, email, bio, avatarAssetId } = value;

  if (typeof id !== 'number' || typeof displayName !== 'string') {
    return undefined;
  }

  const user: User = { id, displayName };

  if (typeof email === 'string') {
    user.email = email;
  }

  if (typeof bio === 'string') {
    user.bio = bio;
  }

  if (avatarAssetId === null || typeof avatarAssetId === 'number') {
    user.avatarAssetId = avatarAssetId;
  }

  return user;
}

function createFallbackUser(email: string): User {
  return {
    id: 0,
    displayName: email.split('@')[0] || email,
    email,
  };
}

export async function getCurrentProfileUser(accessToken: string | undefined): Promise<User> {
  if (!accessToken) {
    return guestUser;
  }

  try {
    const profileRes = await fetch(`${API_GATEWAY_URL}/users/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    });

    if (profileRes.ok) {
      const user = parseUser(await profileRes.json());

      if (user) {
        return user;
      }
    }
  } catch {
    // gateway unavailable
  }

  const email = decodeEmailFromToken(accessToken);

  if (email) {
    return createFallbackUser(email);
  }

  return guestUser;
}
