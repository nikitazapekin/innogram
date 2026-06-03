export type Post = {
  id: string;
  content: string;
  author: { id: string; name: string; avatar?: string };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
};
