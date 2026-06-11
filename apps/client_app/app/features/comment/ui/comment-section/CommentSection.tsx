'use client';

import type { Comment } from '@/app/entities/post';
import { CommentForm } from '../comment-form/CommentForm';
import { CommentItem } from '../comment-item/CommentItem';
import styles from './CommentSection.module.scss';

type CommentSectionProps = {
  comments: Comment[];
  profileId: number | null;
  onAddComment: (content: string) => Promise<void>;
  onLikeComment: (id: string) => void;
  onEditComment: (id: string, content: string) => void;
  onDeleteComment: (id: string) => void;
  onReplyComment: (parentId: string, content: string) => Promise<void>;
};

export function CommentSection({
  comments,
  profileId,
  onAddComment,
  onLikeComment,
  onEditComment,
  onDeleteComment,
  onReplyComment,
}: CommentSectionProps) {
  return (
    <div className={styles.section}>
      <CommentForm onSubmit={onAddComment} />
      <div className={styles.list}>
        {comments.length === 0 ? (
          <p className={styles.empty}>Нет комментариев</p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              profileId={profileId}
              onLike={onLikeComment}
              onEdit={onEditComment}
              onDelete={onDeleteComment}
              onReply={onReplyComment}
            />
          ))
        )}
      </div>
    </div>
  );
}
