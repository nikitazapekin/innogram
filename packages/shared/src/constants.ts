export const CORE_HTTP_PORT = Number(process.env.CORE_HTTP_PORT ?? 3001);
export const AUTH_HTTP_PORT = Number(process.env.AUTH_HTTP_PORT ?? 3002);
export const POSTS_HTTP_PORT = Number(process.env.POSTS_HTTP_PORT ?? 3003);
export const SWAGGER_PATH = process.env.SWAGGER_PATH ?? 'api/docs';

export function getNatsServers(): string[] {
  return [process.env.NATS_URL ?? 'nats://localhost:4222'];
}

export const CLIENT_TOKENS = {
  authClient: 'AUTH_CLIENT',
  postsClient: 'POSTS_CLIENT',
} as const;

export const SUBJECTS = {
  test: 'test.test',
  validateToken: 'auth.validate-token',
  getPosts: 'posts.find-all',
  createPost: 'posts.create',
} as const;

export const QUEUES = {
  auth: 'auth_queue',
  posts: 'posts_queue',
} as const;
