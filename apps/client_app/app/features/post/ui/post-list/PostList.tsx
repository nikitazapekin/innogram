'use client';

import { PostCard } from '../post-card/PostCard';
import type { Post, Comment } from '@/app/entities/post';
import styles from './PostList.module.scss';

type PostListProps = {
  posts?: Post[];
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
  onEdit?: (id: string, content: string) => void;
  onDelete?: (id: string) => void;
  commentsByPost?: Record<string, Comment[]>;
  profileId?: number | null;
  onToggleComments?: (postId: string) => void;
  onAddComment?: (postId: string, content: string) => Promise<void>;
  onLikeComment?: (id: string) => void;
  onEditComment?: (id: string, content: string) => void;
  onDeleteComment?: (id: string) => void;
  onReplyComment?: (postId: string, parentId: string, content: string) => Promise<void>;
};

export function PostList({
  posts = [],
  onLike,
  onDislike,
  onEdit,
  onDelete,
  commentsByPost = {},
  profileId,
  onToggleComments,
  onAddComment,
  onLikeComment,
  onEditComment,
  onDeleteComment,
  onReplyComment,
}: PostListProps) {
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
          comments={commentsByPost[post.id]}
          profileId={profileId}
          onToggleComments={onToggleComments}
          onAddComment={onAddComment}
          onLikeComment={onLikeComment}
          onEditComment={onEditComment}
          onDeleteComment={onDeleteComment}
          onReplyComment={onReplyComment}
        />
      ))}
    </div>
  );
}
