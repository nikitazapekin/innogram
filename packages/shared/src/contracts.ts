export interface UserSnapshot {
  id: string;
  email: string;
  displayName: string;
}

export interface PostSnapshot {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface ValidateTokenRequest {
  accessToken: string;
}

export interface ValidateTokenResponse {
  isValid: boolean;
  user: UserSnapshot;
  message: string;
}

export interface FindPostsRequest {
  userId: string;
}

export interface FindPostsResponse {
  items: PostSnapshot[];
  total: number;
  authorizedUser: UserSnapshot;
  message: string;
}

export interface CreatePostRequest {
  authorId: string;
  title: string;
  content: string;
}

export interface CreatePostResponse {
  post: PostSnapshot;
  authorizedUser: UserSnapshot;
  message: string;
}
