export type BackendAsset = {
  id: number;
  fileName: string;
  mimeType: string;
  url?: string;
};

export type BackendMessage = {
  id: number;
  chatId: number;
  authorProfileId: number;
  content: string | null;
  createdAt: string;
  updatedAt?: string;
  assets?: BackendAsset[];
};

export type BackendChat = {
  id: number;
  createdAt: string;
  updatedAt: string;
  participantCount?: number;
  participants?: Array<{
    id: number;
    displayName?: string;
    avatarAssetId?: number | null;
  }>;
};
