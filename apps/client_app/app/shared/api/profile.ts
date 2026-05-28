import type { User } from '@/app/entities/user';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3004';
const CORE_URL = 'http://localhost:3001';

const guestUser: User = { id: 0, displayName: 'Гость', email: '' };

function decodeEmailFromToken(token: string): string | undefined {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()) as {
      email?: string;
    };

    return payload.email;
  } catch {
    return undefined;
  }
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

  const email = decodeEmailFromToken(accessToken);

  if (!email) {
    return guestUser;
  }

  try {
    const userRes = await fetch(`${CORE_URL}/auth/user?email=${encodeURIComponent(email)}`, {
      cache: 'no-store',
    });

    if (!userRes.ok) {
      return createFallbackUser(email);
    }

    const userEntity: { id: number; email: string } = await userRes.json();

    const profileRes = await fetch(`${GATEWAY_URL}/users/${userEntity.id}`, {
      cache: 'no-store',
    });

    if (!profileRes.ok) {
      return createFallbackUser(email);
    }

    const profile: {
      id: number;
      displayName: string;
      bio?: string;
      avatarAssetId?: number | null;
    } = await profileRes.json();

    return {
      id: profile.id,
      displayName: profile.displayName,
      email: userEntity.email,
      bio: profile.bio,
      avatarAssetId: profile.avatarAssetId,
    };
  } catch {
    return createFallbackUser(email);
  }
}
