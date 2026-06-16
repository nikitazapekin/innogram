export type SortMode = 'newest' | 'oldest' | 'title';

export function buildPostsQuery(sort: SortMode, search: string): Record<string, string> {
  const query: Record<string, string> = {};

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

  return query;
}

export const postsQueryKey = (sort: SortMode, search: string) => ['posts', sort, search] as const;
