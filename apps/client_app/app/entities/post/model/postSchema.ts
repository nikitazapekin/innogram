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
  dislikesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isDisliked: boolean;
  createdAt: string;
  updatedAt?: string;
  authorProfileId?: number;
};

export type Comment = {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
  updatedAt?: string;
  parentId?: string;
  likesCount: number;
  isLiked: boolean;
  children?: Comment[];
};
