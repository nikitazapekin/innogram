import { cookies } from 'next/headers';

import { getCurrentProfileUser } from '@/app/shared/api/profile';

import { Profile } from './Profile';

export async function ProfilePage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const user = await getCurrentProfileUser(accessToken);

  return <Profile user={user} />;
}
