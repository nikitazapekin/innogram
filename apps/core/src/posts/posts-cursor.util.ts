import { BadRequestException } from '@nestjs/common';

export type PostsCursorPayload = {
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  id: number;
  createdAt?: string;
  updatedAt?: string;
  title?: string;
};

export const encodePostsCursor = (payload: PostsCursorPayload): string =>
  Buffer.from(JSON.stringify(payload)).toString('base64url');

export const decodePostsCursor = (raw: string): PostsCursorPayload => {
  try {
    const parsed: unknown = JSON.parse(Buffer.from(raw, 'base64url').toString());

    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as PostsCursorPayload).id !== 'number' ||
      typeof (parsed as PostsCursorPayload).sortBy !== 'string' ||
      ((parsed as PostsCursorPayload).sortOrder !== 'ASC' &&
        (parsed as PostsCursorPayload).sortOrder !== 'DESC')
    ) {
      throw new Error('Invalid cursor payload');
    }

    return parsed as PostsCursorPayload;
  } catch {
    throw new BadRequestException('Invalid cursor value.');
  }
};
