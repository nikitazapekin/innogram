import { CORE_API_URL } from '@/app/shared/config/api';
import { getAccessToken } from '@/lib/auth';
import type { Post } from '@/app/entities/post';
import { mapPost } from '@/app/shared/api/posts';
import type { BackendPost } from '@/app/shared/api/posts';

const BASE = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

export type ProfileDto = {
  id?: number;
  displayName?: string;
  bio?: string;
  avatarAssetId?: number | null;
  isPrivate?: boolean;
};

async function authFetch(url: string, opts?: RequestInit) {
  const token = getAccessToken();

  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  if (opts?.headers) {
    Object.assign(headers, opts.headers);
  }

  const res = await fetch(url, {
    ...opts,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body?.message || 'Request failed';
    throw new Error(message);
  }

  const text = await res.text();

  if (text.length === 0) {
    return null;
  }

  return JSON.parse(text);
}

export async function getProfile(): Promise<ProfileDto | null> {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  return authFetch(`${BASE}/users/profile`);
}

export async function updateProfile(data: ProfileDto): Promise<void> {
  await authFetch(`${BASE}/users/profile`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getUserPosts(profileId: number): Promise<Post[]> {
  const data = await authFetch(`${BASE}/users/${profileId}/posts`);

  let posts: BackendPost[];

  if (Array.isArray(data)) {
    posts = data;
  } else {
    posts = data?.data ?? [];
  }

  return posts.map(mapPost);
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

export async function searchUsers(query: string): Promise<ProfileDto[]> {
  if (!query.trim()) {
    return [];
  }

  return authFetch(`${BASE}/users?searchTerm=${encodeURIComponent(query)}`);
}

export async function getUserProfile(id: number): Promise<ProfileDto> {
  return authFetch(`${BASE}/users/${id}`);
}

export type FollowState = 'none' | 'following' | 'requested';

export type FollowResult = { status: 'following' } | { status: 'requested'; requestId: number };

export async function getRelationship(targetProfileId: number): Promise<{ status: FollowState }> {
  return authFetch(`${BASE}/users/${targetProfileId}/relationship`);
}

export async function followUser(followerId: number, targetId: number): Promise<FollowResult> {
  const result = await authFetch(`${BASE}/users/${followerId}/following/${targetId}`, {
    method: 'POST',
  });

  if (result && typeof result.id === 'number') {
    return { status: 'requested', requestId: result.id };
  }

  return { status: 'following' };
}

export async function unfollowUser(followerId: number, targetId: number): Promise<void> {
  await authFetch(`${BASE}/users/${followerId}/following/${targetId}`, { method: 'DELETE' });
}

export async function getFollowers(id: number): Promise<ProfileDto[]> {
  return authFetch(`${BASE}/users/${id}/followers`);
}

export async function getFollowing(id: number): Promise<ProfileDto[]> {
  return authFetch(`${BASE}/users/${id}/following`);
}

export async function isFollowing(followerId: number, targetId: number): Promise<boolean> {
  const following = await getFollowing(followerId);
  return following.some((profile) => profile.id === targetId);
}

export type FollowRequestDto = {
  id: number;
  followerProfileId: number;
  followingProfileId: number;
  status: string;
  createdAt?: string;
};

export async function getPendingFollowRequests(profileId: number): Promise<FollowRequestDto[]> {
  return authFetch(`${BASE}/users/${profileId}/follow-requests/pending`);
}

export async function respondToFollowRequest(
  profileId: number,
  requestId: number,
  status: 'approved' | 'rejected',
): Promise<void> {
  await authFetch(`${BASE}/users/${profileId}/follow-requests/${requestId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}
