import { getAccessToken } from '@/lib/auth';
import type { Comment } from '@/app/entities/post';

const BASE = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

export interface BackendComment {
  id: number;
  content: string;
  authorProfileId: number;
  authorName?: string;
  authorAvatar?: string;
  parentId?: number | null;
  likesCount?: number;
  isLiked?: boolean;
  createdAt: string;
  updatedAt?: string;
  replies?: BackendComment[];
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

function mapComment(backend: BackendComment): Comment {
  return {
    id: String(backend.id),
    content: backend.content,
    author: {
      id: String(backend.authorProfileId),
      name: backend.authorName || 'User',
      avatar: backend.authorAvatar,
    },
    createdAt: backend.createdAt,
    updatedAt: backend.updatedAt,
    parentId: backend.parentId ? String(backend.parentId) : undefined,
    likesCount: backend.likesCount ?? 0,
    isLiked: backend.isLiked ?? false,
    children: backend.replies ? backend.replies.map(mapComment) : [],
  };
}

export async function getComments(postId: number): Promise<Comment[]> {
  const data = await authFetch(`${BASE}/posts/${postId}/comments`);
  const list: BackendComment[] = Array.isArray(data) ? data : (data?.data ?? []);
  return list.map(mapComment);
}

export async function createComment(
  postId: number,
  authorProfileId: number,
  content: string,
  parentId?: number,
): Promise<Comment> {
  const body: Record<string, unknown> = { authorProfileId, content };
  if (parentId) body.parentId = parentId;
  return mapComment(
    await authFetch(`${BASE}/comments/${postId}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  );
}

export async function updateComment(id: number, content: string): Promise<Comment> {
  return mapComment(
    await authFetch(`${BASE}/comments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    }),
  );
}

export async function deleteComment(id: number): Promise<void> {
  await authFetch(`${BASE}/comments/${id}`, { method: 'DELETE' });
}

export async function likeComment(commentId: number, profileId: number): Promise<void> {
  await authFetch(`${BASE}/comments/${commentId}/like/${profileId}`, { method: 'POST' });
}

export async function unlikeComment(commentId: number, profileId: number): Promise<void> {
  await authFetch(`${BASE}/comments/${commentId}/like/${profileId}`, { method: 'DELETE' });
}
