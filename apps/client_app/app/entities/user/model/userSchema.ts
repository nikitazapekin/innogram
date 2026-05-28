export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  isPrivate: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowed: boolean;
  isFollowing: boolean;
  hasFollowRequest: boolean;
};

export type FollowRequest = {
  id: string;
  user: User;
  createdAt: string;
};
