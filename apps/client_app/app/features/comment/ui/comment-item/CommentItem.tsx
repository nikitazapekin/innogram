'use client';

import { useState } from 'react';
import type { Comment } from '@/app/entities/post';
import { CommentForm } from '../comment-form/CommentForm';
import styles from './CommentItem.module.scss';

type CommentItemProps = {
  comment: Comment;
  profileId: number | null;
  onLike: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onReply: (parentId: string, content: string) => Promise<void>;
};

export function CommentItem({
  comment,
  profileId,
  onLike,
  onEdit,
  onDelete,
  onReply,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText] = useState(comment.content);

  const isAuthor = profileId !== null && comment.author.id === String(profileId);

  if (editing) {
    return (
      <div className={styles.item}>
        <div className={styles.editBox}>
          <CommentForm
            initialValue={editText}
            submitLabel="Сохранить"
            placeholder=""
            onSubmit={async (text) => {
              await onEdit(comment.id, text);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.item}>
      <div className={styles.header}>
        <div className={styles.avatarPlaceholder}>
          {comment.author.name.charAt(0).toUpperCase()}
        </div>
        <div className={styles.authorName}>{comment.author.name}</div>
        <div className={styles.time}>{new Date(comment.createdAt).toLocaleString()}</div>
      </div>

      <p className={styles.content}>{comment.content}</p>

      <div className={styles.actions}>
        <button className={styles.action} type="button" onClick={() => onLike(comment.id)}>
          {comment.isLiked ? '✓ Лайк' : 'Лайк'} {comment.likesCount}
        </button>
        <button className={styles.action} type="button" onClick={() => setShowReplyForm((p) => !p)}>
          Ответить
        </button>
        {isAuthor && (
          <>
            <button className={styles.action} type="button" onClick={() => setEditing(true)}>
              Редактировать
            </button>
            <button className={styles.action} type="button" onClick={() => onDelete(comment.id)}>
              Удалить
            </button>
          </>
        )}
      </div>

      {showReplyForm && (
        <div className={styles.replyForm}>
          <CommentForm
            placeholder="Написать ответ..."
            submitLabel="Ответить"
            onSubmit={async (text) => {
              await onReply(comment.id, text);
              setShowReplyForm(false);
            }}
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {comment.children && comment.children.length > 0 && (
        <div className={styles.children}>
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              profileId={profileId}
              onLike={onLike}
              onEdit={onEdit}
              onDelete={onDelete}
              onReply={onReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
