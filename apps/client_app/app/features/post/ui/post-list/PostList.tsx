'use client';

import { PostCard } from '../post-card/PostCard';
import type { Post } from '@/app/entities/post';
import styles from './PostList.module.scss';

const demoPosts: Post[] = [
  {
    id: '1',
    content: 'Привет! Это первый пост в нашей новой соцсети.',
    author: { id: 'u1', name: 'Анна Иванова' },
    likesCount: 12,
    commentsCount: 3,
    isLiked: false,
    createdAt: '2026-05-27T10:00:00Z',
  },
  {
    id: '2',
    content: 'Отличный день для прогулки!',
    author: { id: 'u2', name: 'Максим Петров' },
    likesCount: 24,
    commentsCount: 7,
    isLiked: true,
    createdAt: '2026-05-26T15:30:00Z',
  },
];

export function PostList() {
  return (
    <div className={styles.list}>
      {demoPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
