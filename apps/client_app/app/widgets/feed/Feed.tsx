'use client';

import { useEffect, useState } from 'react';
import styles from './Feed.module.scss';
import { PostSearch } from '@/app/features/post/ui/post-search/PostSearch';
import { PostCreate } from '@/app/features/post/ui/post-create/PostCreate';
import { PostList } from '@/app/features/post/ui/post-list/PostList';
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  dislikePost,
  undislikePost,
} from '@/app/shared/api/posts';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  unlikeComment,
} from '@/app/shared/api/comments';
import { getProfile } from '@/app/shared/api/users';
import type { Post, Comment } from '@/app/entities/post';

type SortMode = 'newest' | 'oldest' | 'title';
type FilterMode = 'all' | 'mine';

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<SortMode>('newest');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [search, setSearch] = useState('');
  const [profileId, setProfileId] = useState<number | null>(null);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, Comment[]>>({});
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [dislikedPosts, setDislikedPosts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getProfile().then((profile) => {
      const pid = profile?.id;
      if (pid) setProfileId(pid);
    });
  }, []);

  const fetchPosts = async () => {
    try {
      const query: Record<string, string> = {};
      if (sort === 'newest') {
        query.sortBy = 'createdAt';
        query.sortOrder = 'DESC';
      } else if (sort === 'oldest') {
        query.sortBy = 'createdAt';
        query.sortOrder = 'ASC';
      } else if (sort === 'title') {
        query.sortBy = 'title';
        query.sortOrder = 'ASC';
      }
      if (search) query.search = search;
      setPosts(await getPosts(query));
    } catch {
      setPosts([]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sort, search]);

  const handleCreate = async (content: string, file?: File) => {
    const created = await createPost(content, file);
    setPosts((prev) => [created, ...prev]);
  };

  const handleLike = async (id: string) => {
    if (!profileId) return;

    const isLiked = likedPosts[id] ?? false;
    const isDisliked = dislikedPosts[id] ?? false;

    if (isLiked) {
      await unlikePost(Number(id), profileId);

      setLikedPosts((prev) => ({ ...prev, [id]: false }));
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== id) return post;
          return { ...post, isLiked: false, likesCount: post.likesCount - 1 };
        }),
      );
    } else {
      await likePost(Number(id), profileId);

      setLikedPosts((prev) => ({ ...prev, [id]: true }));
      if (isDisliked) setDislikedPosts((prev) => ({ ...prev, [id]: false }));
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== id) return post;

          const updated = {
            ...post,
            isLiked: true,
            likesCount: post.likesCount + 1,
            isDisliked: false,
            dislikesCount: post.dislikesCount,
          };

          if (isDisliked) {
            updated.dislikesCount = post.dislikesCount - 1;
          }

          return updated;
        }),
      );
    }
  };

  const handleDislike = async (id: string) => {
    if (!profileId) return;

    const isDisliked = dislikedPosts[id] ?? false;
    const isLiked = likedPosts[id] ?? false;

    if (isDisliked) {
      await undislikePost(Number(id), profileId);

      setDislikedPosts((prev) => ({ ...prev, [id]: false }));
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== id) return post;
          return { ...post, isDisliked: false, dislikesCount: post.dislikesCount - 1 };
        }),
      );
    } else {
      await dislikePost(Number(id), profileId);

      setDislikedPosts((prev) => ({ ...prev, [id]: true }));
      if (isLiked) setLikedPosts((prev) => ({ ...prev, [id]: false }));
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== id) return post;

          const updated = {
            ...post,
            isDisliked: true,
            dislikesCount: post.dislikesCount + 1,
            isLiked: false,
            likesCount: post.likesCount,
          };

          if (isLiked) {
            updated.likesCount = post.likesCount - 1;
          }

          return updated;
        }),
      );
    }
  };

  const handleToggleComments = async (postId: string) => {
    if (commentsByPost[postId]) return;
    try {
      const data = await getComments(Number(postId));
      setCommentsByPost((prev) => ({ ...prev, [postId]: data }));
    } catch {
      setCommentsByPost((prev) => ({ ...prev, [postId]: [] }));
    }
  };

  function updateCommentLists(transform: (list: Comment[]) => Comment[]) {
    setCommentsByPost((prev) => {
      const result: Record<string, Comment[]> = {};
      for (const postId of Object.keys(prev)) {
        result[postId] = transform(prev[postId]);
      }
      return result;
    });
  }

  function mapTree(
    list: Comment[],
    matchId: string,
    update: (comment: Comment) => Comment,
  ): Comment[] {
    return list.map((comment) => {
      if (comment.id === matchId) return update(comment);
      if (comment.children)
        return { ...comment, children: mapTree(comment.children, matchId, update) };
      return comment;
    });
  }

  function filterTree(list: Comment[], matchId: string): Comment[] {
    return list
      .filter((comment) => comment.id !== matchId)
      .map((comment) => {
        if (comment.children)
          return { ...comment, children: filterTree(comment.children, matchId) };
        return comment;
      });
  }

  const handleAddComment = async (postId: string, content: string) => {
    if (!profileId) return;
    const created = await createComment(Number(postId), profileId, content);
    setCommentsByPost((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] ?? []), created],
    }));
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, commentsCount: post.commentsCount + 1 } : post,
      ),
    );
  };

  const handleLikeComment = async (id: string) => {
    if (!profileId) return;

    const isLiked = likedComments[id] ?? false;
    const toggle = isLiked ? unlikeComment : likeComment;

    try {
      await toggle(Number(id), profileId);
    } catch {
      return;
    }

    setLikedComments((prev) => ({ ...prev, [id]: !isLiked }));

    updateCommentLists((list) =>
      mapTree(list, id, (comment) => ({
        ...comment,
        isLiked: !isLiked,
        likesCount: isLiked ? comment.likesCount - 1 : comment.likesCount + 1,
      })),
    );
  };

  const handleEditComment = async (id: string, content: string) => {
    await updateComment(Number(id), content);
    updateCommentLists((list) => mapTree(list, id, (comment) => ({ ...comment, content })));
  };

  const handleDeleteComment = async (id: string) => {
    await deleteComment(Number(id));
    updateCommentLists((list) => filterTree(list, id));
  };

  const handleReplyComment = async (postId: string, parentId: string, content: string) => {
    if (!profileId) return;
    const created = await createComment(Number(postId), profileId, content, Number(parentId));
    updateCommentLists((list) =>
      mapTree(list, parentId, (comment) => ({
        ...comment,
        children: [...(comment.children ?? []), created],
      })),
    );
  };

  return (
    <div className={styles.feed}>
      <PostSearch onSearch={setSearch} />
      <div className={styles.controls}>
        {(['newest', 'oldest', 'title'] as SortMode[]).map((mode) => (
          <button
            key={mode}
            className={`${styles.control} ${sort === mode ? styles.control_active : ''}`}
            type="button"
            onClick={() => setSort(mode)}
          >
            {mode === 'newest' ? 'Новые' : mode === 'oldest' ? 'Старые' : 'По заголовку'}
          </button>
        ))}
        <div className={styles.divider} />
        {(['all', 'mine'] as FilterMode[]).map((mode) => (
          <button
            key={mode}
            className={`${styles.control} ${filter === mode ? styles.control_active : ''}`}
            type="button"
            onClick={() => setFilter(mode)}
          >
            {mode === 'all' ? 'Все' : 'Мои'}
          </button>
        ))}
      </div>
      <PostCreate onSubmit={handleCreate} />
      <PostList
        posts={posts}
        onLike={handleLike}
        onDislike={handleDislike}
        onEdit={async (id, content) => {
          await updatePost(Number(id), content);
          setPosts((prev) =>
            prev.map((post) => {
              if (post.id !== id) return post;
              return { ...post, content };
            }),
          );
        }}
        onDelete={async (id) => {
          await deletePost(Number(id));
          setPosts((prev) => prev.filter((post) => post.id !== id));
        }}
        commentsByPost={commentsByPost}
        profileId={profileId}
        onToggleComments={handleToggleComments}
        onAddComment={handleAddComment}
        onLikeComment={handleLikeComment}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
        onReplyComment={handleReplyComment}
      />
    </div>
  );
}
