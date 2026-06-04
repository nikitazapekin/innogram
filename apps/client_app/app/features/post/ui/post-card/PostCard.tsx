'use client';

import { useState } from 'react';
import type { Post } from '@/app/entities/post';
import styles from './PostCard.module.scss';

type PostCardProps = {
  post: Post;
  onLike?: (id: string) => void;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
};

export function PostCard({ post, onLike, onEdit, onDelete }: PostCardProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.origin + '/posts/' + post.id);
  };

  if (editing) {
    return (
      <article className={styles.card}>
        <textarea
          className={styles.textarea}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          rows={3}
        />
        <div className={styles.actions}>
          <button
            className={styles.action}
            type="button"
            onClick={() => {
              onEdit?.(post.id, editText);
              setEditing(false);
            }}
          >
            Сохранить
          </button>
          <button className={styles.action} type="button" onClick={() => setEditing(false)}>
            Отмена
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className={styles.card}>
      <div className={styles.author}>
        <div className={styles.avatarPlaceholder}>{post.author.name.charAt(0).toUpperCase()}</div>
        <div>
          <div className={styles.authorName}>{post.author.name}</div>
          <div className={styles.time}>{new Date(post.createdAt).toLocaleString()}</div>
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
        <button className={styles.action} type="button" onClick={() => onLike?.(post.id)}>
          Нравится
        </button>
        <button className={styles.action} type="button">
          Комментировать
        </button>
        <button className={styles.action} type="button" onClick={handleShare}>
          Поделиться
        </button>
        <button className={styles.action} type="button" onClick={() => setEditing(true)}>
          Редактировать
        </button>
        <button className={styles.action} type="button" onClick={() => onDelete?.(post.id)}>
          Удалить
        </button>
      </div>
    </article>
  );
}
