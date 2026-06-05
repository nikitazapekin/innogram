export type ChatParticipant = {
  id: number;
  profileId: number;
  name: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
};

export type MessageAsset = {
  id: number;
  fileName: string;
  mimeType: string;
  url: string;
};

export type Message = {
  id: number;
  chatId: number;
  authorProfileId: number;
  authorName: string;
  authorAvatar?: string;
  content: string | null;
  assets: MessageAsset[];
  createdAt: string;
};

export type Chat = {
  id: number;
  type: 'private' | 'group';
  name?: string;
  avatar?: string;
  participants: ChatParticipant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
};
