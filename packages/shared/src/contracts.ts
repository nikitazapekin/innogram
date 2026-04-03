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

export interface ValidateTokenSuccessResponse {
  isValid: boolean;
  user: UserSnapshot;
  message: string;
}

export interface ErrorResponse {
  error: true;
  message: string;
}

export type ServiceResponse<TSuccess> = TSuccess | ErrorResponse;

export type ValidateTokenResponse = ServiceResponse<ValidateTokenSuccessResponse>;

export interface FindPostsRequest {
  userId: string;
}

export interface FindPostsSuccessResponse {
  items: PostSnapshot[];
  total: number;
  authorizedUser: UserSnapshot;
  message: string;
}

export type FindPostsResponse = ServiceResponse<FindPostsSuccessResponse>;

export interface CreatePostRequest {
  authorId: string;
  title: string;
  content: string;
}

export interface CreatePostSuccessResponse {
  post: PostSnapshot;
  authorizedUser: UserSnapshot;
  message: string;
}

export type CreatePostResponse = ServiceResponse<CreatePostSuccessResponse>;
