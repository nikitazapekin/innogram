import { getAccessToken } from '@/lib/auth';
import type { Post } from '@/app/entities/post';

const BASE = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

interface BackendPost {
  id: number;
  content: string;
  title?: string;
  authorProfileId: number;
  media?: { id: number; url: string; type: 'image' | 'video' }[];
  likesCount?: number;
  dislikesCount?: number;
  createdAt: string;
  updatedAt?: string;
}

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
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

function mapPost(backendPost: BackendPost): Post {
  const mediaItems = backendPost.media?.map((mediaItem) => ({
    id: String(mediaItem.id),
    url: mediaItem.url,
    type: mediaItem.type,
  }));

  return {
    id: String(backendPost.id),
    content: backendPost.content,
    author: {
      id: String(backendPost.authorProfileId),
      name: backendPost.title || 'User',
    },
    media: mediaItems ?? undefined,
    likesCount: backendPost.likesCount ?? 0,
    dislikesCount: backendPost.dislikesCount ?? 0,
    commentsCount: 0,
    isLiked: false,
    isDisliked: false,
    createdAt: backendPost.createdAt,
    updatedAt: backendPost.updatedAt,
  };
}

async function uploadAsset(file: File): Promise<number> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${BASE}/assets/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getAccessToken()}` },
    body: form,
  });
  if (!res.ok) throw new Error('File upload failed');
  const asset: { id: number } = await res.json();
  return asset.id;
}

export async function getPosts(query?: Record<string, string>): Promise<Post[]> {
  let url = `${BASE}/posts`;

  if (query) {
    const queryString = new URLSearchParams(query).toString();
    url += '?' + queryString;
  }

  const data = await authFetch(url);

  let posts: BackendPost[];

  if (Array.isArray(data)) {
    posts = data;
  } else {
    posts = data.data ?? [];
  }

  return posts.map(mapPost);
}

export async function createPost(content: string, file?: File): Promise<Post> {
  const body: Record<string, unknown> = { title: content.slice(0, 50), content };
  if (file) {
    const assetId = await uploadAsset(file);
    body.assetIds = [assetId];
  }
  return mapPost(await authFetch(`${BASE}/posts`, { method: 'POST', body: JSON.stringify(body) }));
}

export async function updatePost(id: number, content: string): Promise<Post> {
  return mapPost(
    await authFetch(`${BASE}/posts/${id}`, { method: 'PATCH', body: JSON.stringify({ content }) }),
  );
}

export async function deletePost(id: number): Promise<void> {
  await authFetch(`${BASE}/posts/${id}`, { method: 'DELETE' });
}

export async function likePost(postId: number, profileId: number): Promise<void> {
  await authFetch(`${BASE}/posts/${postId}/like/${profileId}`, { method: 'POST' });
}

export async function unlikePost(postId: number, profileId: number): Promise<void> {
  await authFetch(`${BASE}/posts/${postId}/like/${profileId}`, { method: 'DELETE' });
}

export async function dislikePost(postId: number, profileId: number): Promise<void> {
  await authFetch(`${BASE}/posts/${postId}/dislike/${profileId}`, { method: 'POST' });
}

export async function undislikePost(postId: number, profileId: number): Promise<void> {
  await authFetch(`${BASE}/posts/${postId}/dislike/${profileId}`, { method: 'DELETE' });
}
