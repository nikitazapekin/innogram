'use client';

import { PostCard } from '../post-card/PostCard';
import type { Post } from '@/app/entities/post';
import styles from './PostList.module.scss';

const demo: Post[] = [
  {
    id: '1',
    content: 'Первый пост!',
    author: { id: 'u1', name: 'Анна Иванова' },
    likesCount: 12,
    commentsCount: 3,
    isLiked: false,
    createdAt: '2026-05-27',
  },
  {
    id: '2',
    content: 'Отличный день!',
    author: { id: 'u2', name: 'Максим Петров' },
    likesCount: 24,
    commentsCount: 7,
    isLiked: true,
    createdAt: '2026-05-26',
  },
];

export function PostList() {
  return (
    <div className={styles.list}>
      {demo.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
