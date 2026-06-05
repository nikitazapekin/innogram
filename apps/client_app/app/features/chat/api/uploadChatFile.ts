import { CORE_API_URL } from '@/app/shared/config/api';

export type UploadedAsset = {
  id: number;
  fileName: string;
  mimeType: string;
  url: string;
};

export async function uploadChatFile(file: File, profileId: number): Promise<UploadedAsset> {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('profileId', String(profileId));

  const response = await fetch(`${CORE_API_URL}/chats/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Ошибка загрузки файла' }));
    throw new Error(error.message);
  }

  return response.json();
}
