import { PostDto } from './post.dto';

export class CursorPaginatedPostsDto {
  data: PostDto[];
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
}
