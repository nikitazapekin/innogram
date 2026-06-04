'use client';

import { PostCard } from '../post-card/PostCard';
import type { Post } from '@/app/entities/post';
import styles from './PostList.module.scss';

const demoPosts: Post[] = [];

export function PostList() {
  return (
    <div className={styles.list}>
      {demoPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
