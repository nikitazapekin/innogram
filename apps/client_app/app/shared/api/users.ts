import { CORE_API_URL } from '@/app/shared/config/api';
import { getAccessToken } from '@/lib/auth';

export type ProfileDto = {
  id?: number;
  displayName?: string;
  bio?: string;
  avatarAssetId?: number | null;
};

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
