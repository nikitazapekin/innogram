export type MediaItem = {
  id: string;
  url: string;
  type: 'image' | 'video';
};

export type Author = {
  id: string;
  name: string;
  avatar?: string;
};

export type Post = {
  id: string;
  content: string;
  media?: MediaItem[];
  author: Author;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt?: string;
  authorProfileId?: number;
};

export type Comment = {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
};
