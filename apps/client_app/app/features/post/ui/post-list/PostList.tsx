'use client';

import { PostCard } from '../post-card/PostCard';
import type { Post } from '@/app/entities/post';
import styles from './PostList.module.scss';

type PostListProps = {
  posts: Post[];
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
};

export function PostList({ posts, onLike, onDislike, onEdit, onDelete }: PostListProps) {
  if (!posts.length) {
    return (
      <div className={styles.list}>
        <p className={styles.empty}>Нет постов</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onLike={onLike}
          onDislike={onDislike}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
