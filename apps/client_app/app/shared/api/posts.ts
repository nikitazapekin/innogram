import { getAccessToken } from '@/lib/auth';
import type { Post } from '@/app/entities/post';

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
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPost(p: any): Post {
  return {
    id: String(p.id),
    content: p.content,
    author: { id: String(p.authorProfileId), name: p.title || 'User' },
    media:
      p.media?.map((m: { id: number; url: string; type: string }) => ({
        id: String(m.id),
        url: m.url,
        type: m.type,
      })) ?? undefined,
    likesCount: p.likesCount ?? 0,
    dislikesCount: p.dislikesCount ?? 0,
    commentsCount: 0,
    isLiked: false,
    isDisliked: false,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
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
  const qs = query ? '?' + new URLSearchParams(query) : '';
  const data = await authFetch(`${BASE}/posts${qs}`);
  const list = Array.isArray(data) ? data : (data.data ?? []);
  return list.map(mapPost);
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
