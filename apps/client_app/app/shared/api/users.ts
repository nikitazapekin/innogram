import { CORE_API_URL } from '@/app/shared/config/api';
import { getAccessToken } from '@/lib/auth';

const BASE = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

export type ProfileDto = {
  id?: number;
  displayName?: string;
  bio?: string;
  avatarAssetId?: number | null;
};

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

export async function updateProfile(data: ProfileDto): Promise<void> {
  await authFetch(`${BASE}/users/profile`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getUserPosts(profileId: number) {
  return authFetch(`${BASE}/users/${profileId}/posts`);
}

export async function fetchProfiles(): Promise<ProfileDto[]> {
  const response = await fetch(`${CORE_API_URL}/users`);

  if (!response.ok) {
    throw new Error('Не удалось загрузить профили');
  }

  return response.json();
}

export async function fetchCurrentProfile(): Promise<ProfileDto | null> {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  const response = await fetch(`${CORE_API_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}
