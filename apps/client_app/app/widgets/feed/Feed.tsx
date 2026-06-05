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

  const handleAddComment = async (postId: string, content: string) => {
    if (!profileId) return;
    const created = await createComment(Number(postId), profileId, content);
    setCommentsByPost((prev) => {
      const existing = prev[postId] ?? [];
      return { ...prev, [postId]: [...existing, created] };
    });
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

    const updateInTree = (list: Comment[]): Comment[] =>
      list.map((c) => {
        if (c.id === id) {
          return {
            ...c,
            isLiked: !isLiked,
            likesCount: isLiked ? c.likesCount - 1 : c.likesCount + 1,
          };
        }
        if (c.children) return { ...c, children: updateInTree(c.children) };
        return c;
      });

    setCommentsByPost((prev) => {
      const next: Record<string, Comment[]> = {};
      for (const key of Object.keys(prev)) {
        next[key] = updateInTree(prev[key]);
      }
      return next;
    });
  };

  const handleEditComment = async (id: string, content: string) => {
    await updateComment(Number(id), content);

    const updateInTree = (list: Comment[]): Comment[] =>
      list.map((c) => {
        if (c.id === id) return { ...c, content };
        if (c.children) return { ...c, children: updateInTree(c.children) };
        return c;
      });

    setCommentsByPost((prev) => {
      const next: Record<string, Comment[]> = {};
      for (const key of Object.keys(prev)) {
        next[key] = updateInTree(prev[key]);
      }
      return next;
    });
  };

  const handleDeleteComment = async (id: string) => {
    await deleteComment(Number(id));

    const removeFromTree = (list: Comment[]): Comment[] =>
      list
        .filter((c) => c.id !== id)
        .map((c) => {
          if (c.children) return { ...c, children: removeFromTree(c.children) };
          return c;
        });

    setCommentsByPost((prev) => {
      const next: Record<string, Comment[]> = {};
      for (const key of Object.keys(prev)) {
        next[key] = removeFromTree(prev[key]);
      }
      return next;
    });
  };

  const handleReplyComment = async (postId: string, parentId: string, content: string) => {
    if (!profileId) return;
    const created = await createComment(Number(postId), profileId, content, Number(parentId));

    const addChild = (list: Comment[]): Comment[] =>
      list.map((c) => {
        if (c.id === parentId) {
          return { ...c, children: [...(c.children ?? []), created] };
        }
        if (c.children) return { ...c, children: addChild(c.children) };
        return c;
      });

    setCommentsByPost((prev) => {
      const next: Record<string, Comment[]> = {};
      for (const key of Object.keys(prev)) {
        next[key] = addChild(prev[key]);
      }
      return next;
    });
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
              if (post.id !== id) {
                return post;
              }

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
