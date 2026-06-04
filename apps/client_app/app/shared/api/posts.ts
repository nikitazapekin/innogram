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
    likesCount: 0,
    commentsCount: 0,
    isLiked: false,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}

export async function getPosts(query?: Record<string, string>): Promise<Post[]> {
  const qs = query ? '?' + new URLSearchParams(query) : '';
  const data = await authFetch(`${BASE}/posts${qs}`);
  const list = Array.isArray(data) ? data : (data.data ?? []);
  return list.map(mapPost);
}

export async function createPost(content: string, file?: File): Promise<Post> {
  const body = JSON.stringify({ title: content.slice(0, 50), content });
  if (file) {
    const form = new FormData();
    form.append('file', file);
    await fetch(`${BASE}/assets/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      body: form,
    });
  }
  return mapPost(await authFetch(`${BASE}/posts`, { method: 'POST', body }));
}

export async function updatePost(id: number, content: string): Promise<Post> {
  return mapPost(
    await authFetch(`${BASE}/posts/${id}`, { method: 'PATCH', body: JSON.stringify({ content }) }),
  );
}

export async function deletePost(id: number): Promise<void> {
  await authFetch(`${BASE}/posts/${id}`, { method: 'DELETE' });
}
