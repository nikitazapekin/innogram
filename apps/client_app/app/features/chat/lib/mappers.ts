import type { Chat, ChatParticipant, Message, MessageAsset } from '@/app/entities/chat';
import { getCoreAssetUrl } from '@/app/shared/config/api';

import type { BackendChat, BackendMessage } from './backendTypes';

export function getProfileDisplayName(
  profileId: number,
  profileNames: Map<number, string>,
): string {
  return profileNames.get(profileId) ?? `Профиль ${profileId}`;
}

export function mapMessage(message: BackendMessage, profileNames: Map<number, string>): Message {
  let createdAt: string;
  if (typeof message.createdAt === 'string') {
    createdAt = message.createdAt;
  } else {
    createdAt = new Date(message.createdAt).toISOString();
  }

  return {
    id: message.id,
    chatId: message.chatId,
    authorProfileId: message.authorProfileId,
    authorName: getProfileDisplayName(message.authorProfileId, profileNames),
    content: message.content,
    assets: (message.assets ?? []).map(mapAsset),
    createdAt,
  };
}

export function mapAsset(asset: {
  id: number;
  fileName: string;
  mimeType: string;
  url?: string;
}): MessageAsset {
  let url: string;
  if (asset.url) {
    url = getCoreAssetUrl(asset.url);
  } else {
    url = getCoreAssetUrl(`/uploads/${asset.fileName}`);
  }

  return {
    id: asset.id,
    fileName: asset.fileName,
    mimeType: asset.mimeType,
    url,
  };
}

export function mapChat(
  chat: BackendChat,
  profileId: number,
  profileNames: Map<number, string>,
  lastMessage?: Message,
): Chat {
  const count = chat.participantCount ?? chat.participants?.length ?? 2;

  let type: 'group' | 'private';
  if (count > 2) {
    type = 'group';
  } else {
    type = 'private';
  }

  const otherParticipant = chat.participants?.find((participant) => participant.id !== profileId);

  let name: string;
  if (type === 'private' && otherParticipant?.displayName) {
    name = otherParticipant.displayName;
  } else if (type === 'group') {
    name = `Группа #${chat.id}`;
  } else {
    name = `Чат #${chat.id}`;
  }

  const participants: ChatParticipant[] = (chat.participants ?? []).map((participant) => ({
    id: participant.id,
    profileId: participant.id,
    name: participant.displayName ?? getProfileDisplayName(participant.id, profileNames),
    role: 'member',
  }));

  let createdAt: string;
  if (typeof chat.createdAt === 'string') {
    createdAt = chat.createdAt;
  } else {
    createdAt = new Date(chat.createdAt).toISOString();
  }

  let updatedAt: string;
  if (typeof chat.updatedAt === 'string') {
    updatedAt = chat.updatedAt;
  } else {
    updatedAt = new Date(chat.updatedAt).toISOString();
  }

  return {
    id: chat.id,
    type,
    name,
    participants,
    lastMessage,
    unreadCount: 0,
    createdAt,
    updatedAt,
  };
}
