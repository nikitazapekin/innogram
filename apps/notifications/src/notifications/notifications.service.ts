import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsService {
  private readonly baseUrl: string;

  constructor(configService: ConfigService) {
    this.baseUrl = `${configService.get('CORE_API_URL', 'http://localhost:3001')}/notifications`;
  }

  private async request(path: string, options?: RequestInit) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    if (response.status === 404) throw new NotFoundException('Notification was not found.');
    if (!response.ok) throw new Error(`Core API error: ${response.status}`);
    return response.json();
  }

  create(recipientProfileId: number, type: string, payload: Record<string, unknown> | null) {
    return this.request('', {
      method: 'POST',
      body: JSON.stringify({ recipientProfileId, type, payload }),
    });
  }

  findByRecipient(profileId: number, page = 1, limit = 20) {
    return this.request(`/${profileId}?page=${page}&limit=${limit}`);
  }

  findOne(notificationId: string, profileId: number) {
    return this.request(`/${profileId}/${notificationId}`);
  }

  markRead(notificationId: string, profileId: number) {
    return this.request(`/${profileId}/${notificationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: true }),
    });
  }

  markUnread(notificationId: string, profileId: number) {
    return this.request(`/${profileId}/${notificationId}`, {
      method: 'PATCH',
      body: JSON.stringify({ read: false }),
    });
  }

  remove(notificationId: string, profileId: number) {
    return this.request(`/${profileId}/${notificationId}`, { method: 'DELETE' });
  }
}
