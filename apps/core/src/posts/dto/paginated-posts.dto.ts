import { PostDto } from './post.dto';

export class PaginatedPostsDto {
  data: PostDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
