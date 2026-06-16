export type SortMode = 'newest' | 'oldest' | 'title';

export function buildPostsQuery(
  sort: SortMode,
  search: string,
  cursor?: string,
): Record<string, string> {
  const query: Record<string, string> = {
    limit: '10',
  };

  if (sort === 'newest') {
    query.sortBy = 'createdAt';
    query.sortOrder = 'DESC';
  } else if (sort === 'oldest') {
    query.sortBy = 'createdAt';
    query.sortOrder = 'ASC';
  } else if (sort === 'title') {
    query.sortBy = 'title';
    query.sortOrder = 'ASC';
  }

  if (search) {
    query.search = search;
  }

  if (cursor) {
    query.cursor = cursor;
  }

  return query;
}

export const postsQueryKey = (sort: SortMode, search: string) => ['posts', sort, search] as const;
