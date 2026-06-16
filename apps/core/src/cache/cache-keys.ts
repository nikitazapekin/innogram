export const buildAssetUrlCacheKey = (assetId: number): string => `asset:url:${assetId}`;

export const POSTS_FEED_VERSION_KEY = 'posts:feed:version';

type PostsFeedQuery = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
  archived?: boolean;
};

export const buildPostsFeedCacheKey = (version: number, query: PostsFeedQuery): string => {
  const normalized = {
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    sortBy: query.sortBy ?? 'createdAt',
    sortOrder: query.sortOrder ?? 'DESC',
    search: query.search ?? '',
    archived: query.archived === true,
  };

  const payload = Buffer.from(JSON.stringify(normalized)).toString('base64url');

  return `posts:feed:v${version}:${payload}`;
};
