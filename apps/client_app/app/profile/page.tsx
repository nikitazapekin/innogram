import { cookies } from 'next/headers';
import type { User } from '@/app/entities/user';
import { Profile } from '@/app/widgets/profile';

const GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3004';
const CORE_URL = 'http://localhost:3001';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) {
    const guestUser: User = { id: 0, displayName: 'Гость', email: '' };
    return <Profile user={guestUser} />;
  }

  const { email } = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()) as {
    email: string;
  };

  try {
    const userRes = await fetch(`${CORE_URL}/auth/user?email=${encodeURIComponent(email)}`, {
      cache: 'no-store',
    });

    if (userRes.ok) {
      const userEntity: { id: number; email: string } = await userRes.json();

      const profileRes = await fetch(`${GATEWAY_URL}/users/${userEntity.id}`, {
        cache: 'no-store',
      });

      if (profileRes.ok) {
        const profile: {
          id: number;
          displayName: string;
          bio?: string;
          avatarAssetId?: number | null;
        } = await profileRes.json();

        const user: User = {
          id: profile.id,
          displayName: profile.displayName,
          email: userEntity.email,
          bio: profile.bio,
          avatarAssetId: profile.avatarAssetId,
        };

        return <Profile user={user} />;
      }
    }
  } catch {
    // core/gateway недоступны — fallback на email из JWT
  }

  const fallbackUser: User = {
    id: 0,
    displayName: email.split('@')[0],
    email,
  };

  return <Profile user={fallbackUser} />;
}
