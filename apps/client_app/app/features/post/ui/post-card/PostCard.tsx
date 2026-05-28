'use client';

import type { Post } from '@/app/entities/post';
import styles from './PostCard.module.scss';

type PostCardProps = { post: Post };

export function PostCard({ post }: PostCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.author}>
        <div className={styles.avatar}>{post.author.name.charAt(0)}</div>
        <div>
          <div className={styles.name}>{post.author.name}</div>
          <div className={styles.time}>{post.createdAt}</div>
        </div>
      </div>
      <p className={styles.content}>{post.content}</p>
      <div className={styles.stats}>
        <span>{post.likesCount} лайков</span>
        <span>{post.commentsCount} комментариев</span>
      </div>
      <div className={styles.actions}>
        <button className={styles.action} type="button">
          Нравится
        </button>
        <button className={styles.action} type="button">
          Комментировать
        </button>
        <button className={styles.action} type="button">
          Поделиться
        </button>
      </div>
    </article>
  );
}
