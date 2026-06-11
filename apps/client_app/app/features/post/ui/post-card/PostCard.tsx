'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Post, Comment } from '@/app/entities/post';
import { CommentSection } from '@/app/features/comment/ui/comment-section/CommentSection';
import styles from './PostCard.module.scss';

type PostCardProps = {
  post: Post;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
  comments?: Comment[];
  profileId?: number | null;
  onToggleComments?: (postId: string) => void;
  onAddComment?: (postId: string, content: string) => Promise<void>;
  onLikeComment?: (id: string) => void;
  onEditComment?: (id: string, content: string) => void;
  onDeleteComment?: (id: string) => void;
  onReplyComment?: (postId: string, parentId: string, content: string) => Promise<void>;
};

export function PostCard({
  post,
  onLike,
  onDislike,
  onEdit,
  onDelete,
  comments,
  profileId,
  onToggleComments,
  onAddComment,
  onLikeComment,
  onEditComment,
  onDeleteComment,
  onReplyComment,
}: PostCardProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(post.content);
  const [showComments, setShowComments] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.origin + '/posts/' + post.id);
  };

  const handleReply = async (parentId: string, content: string) => {
    await onReplyComment?.(post.id, parentId, content);
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
                <Image
                  fill
                  className={styles.media}
                  alt=""
                  src={item.url}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              )}
            </div>
          ))}
        </div>
      ) : null}

      <div className={styles.stats}>
        <span>{post.likesCount} лайков</span>
        <span>{post.dislikesCount} дизлайков</span>
        <span>{post.commentsCount} комментариев</span>
      </div>

      <div className={styles.actions}>
        <button className={styles.action} type="button" onClick={() => onLike?.(post.id)}>
          {post.isLiked ? '✓ Нравится' : 'Нравится'}
        </button>
        <button className={styles.action} type="button" onClick={() => onDislike?.(post.id)}>
          {post.isDisliked ? '✗ Не нравится' : 'Не нравится'}
        </button>
        <button
          className={styles.action}
          type="button"
          onClick={() => {
            onToggleComments?.(post.id);
            setShowComments((p) => !p);
          }}
        >
          Комментировать {post.commentsCount > 0 ? `(${post.commentsCount})` : ''}
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

      {showComments &&
        comments &&
        onAddComment &&
        onLikeComment &&
        onEditComment &&
        onDeleteComment &&
        onReplyComment && (
          <div className={styles.comments}>
            <CommentSection
              comments={comments}
              profileId={profileId ?? null}
              onAddComment={async (content) => onAddComment(post.id, content)}
              onLikeComment={onLikeComment}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
              onReplyComment={handleReply}
            />
          </div>
        )}
    </article>
  );
}
