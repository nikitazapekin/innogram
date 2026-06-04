import { getAccessToken } from '@/lib/auth';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3004';

async function authFetch(url: string, opts?: RequestInit) {
  const token = getAccessToken();
  const res = await fetch(url, {
    ...opts,
    headers: {
      ...opts?.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message || 'Request failed');
  return res.json();
}

export async function getProfile() {
  return authFetch(`${BASE}/users/profile`);
}

export async function getUserPosts(profileId: number) {
  return authFetch(`${BASE}/users/${profileId}/posts`);
}
