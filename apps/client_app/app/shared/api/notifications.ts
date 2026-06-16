import { getAccessToken } from '@/lib/auth';

const BASE = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

export type NotificationItem = {
  id: string;
  recipientProfileId: number;
  type: string;
  payload: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  readAt: string | null;
  isRead: boolean;
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

  if (!res.ok) {
    throw new Error((await res.json().catch(() => ({})))?.message || 'Request failed');
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getNotifications(recipientProfileId: number): Promise<NotificationItem[]> {
  const data = await authFetch(`${BASE}/notifications?recipientProfileId=${recipientProfileId}`);

  return Array.isArray(data) ? data : [];
}

export async function markNotificationRead(id: string, read: boolean): Promise<NotificationItem> {
  return authFetch(`${BASE}/notifications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ read }),
  });
}

export async function deleteNotification(id: string): Promise<void> {
  await authFetch(`${BASE}/notifications/${id}`, { method: 'DELETE' });
}
