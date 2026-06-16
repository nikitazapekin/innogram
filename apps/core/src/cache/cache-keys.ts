export const buildAssetUrlCacheKey = (assetId: number): string => `asset:url:${assetId}`;

export const POSTS_FEED_VERSION_KEY = 'posts:feed:version';

type PostsFeedQuery = {
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
  archived?: boolean;
};

export const buildPostsFeedCacheKey = (version: number, query: PostsFeedQuery): string => {
  const normalized = {
    cursor: query.cursor ?? '',
    limit: query.limit ?? 10,
    sortBy: query.sortBy ?? 'createdAt',
    sortOrder: query.sortOrder ?? 'DESC',
    search: query.search ?? '',
    archived: query.archived === true,
  };

  const payload = Buffer.from(JSON.stringify(normalized)).toString('base64url');

  return `posts:feed:v${version}:${payload}`;
};
