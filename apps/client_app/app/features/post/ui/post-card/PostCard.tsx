'use client';

import type { Post } from '@/app/entities/post';
import styles from './PostCard.module.scss';

type PostCardProps = { post: Post };

export function PostCard({ post }: PostCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.author}>
        <div className={styles.avatarPlaceholder}>{post.author.name.charAt(0).toUpperCase()}</div>
        <div>
          <div className={styles.authorName}>{post.author.name}</div>
          <div className={styles.time}>{post.createdAt}</div>
        </div>
      </div>

      <p className={styles.content}>{post.content}</p>

      {post.media && post.media.length > 0 ? (
        <div className={styles.mediaGrid}>
          {post.media.map((item) => (
            <div key={item.id} className={styles.mediaItem}>
              {item.type === 'video' ? (
                <video className={styles.media} src={item.url} />
              ) : (
                <img alt="" className={styles.media} src={item.url} />
              )}
            </div>
          ))}
        </div>
      ) : null}

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
