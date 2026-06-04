'use client';

import { useEffect, useState, useCallback } from 'react';
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
import { getProfile } from '@/app/shared/api/users';
import type { Post } from '@/app/entities/post';

type SortMode = 'newest' | 'oldest' | 'title';
type FilterMode = 'all' | 'mine';

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<SortMode>('newest');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [search, setSearch] = useState('');
  const [profileId, setProfileId] = useState<number | null>(null);

  useEffect(() => {
    getProfile()
      .then((p) => setProfileId(p.id))
      .catch(() => {});
  }, []);

  const fetchPosts = useCallback(async () => {
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
  }, [sort, search]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreate = async (content: string, file?: File) => {
    const created = await createPost(content, file);
    setPosts((prev) => [created, ...prev]);
  };

  const handleLike = async (id: string) => {
    if (!profileId) return;
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    if (post.isLiked) {
      await unlikePost(Number(id), profileId);
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isLiked: false, likesCount: p.likesCount - 1 } : p)),
      );
    } else {
      await likePost(Number(id), profileId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                isLiked: true,
                likesCount: p.likesCount + 1,
                isDisliked: false,
                dislikesCount: p.isDisliked ? p.dislikesCount - 1 : p.dislikesCount,
              }
            : p,
        ),
      );
    }
  };

  const handleDislike = async (id: string) => {
    if (!profileId) return;
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    if (post.isDisliked) {
      await undislikePost(Number(id), profileId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isDisliked: false, dislikesCount: p.dislikesCount - 1 } : p,
        ),
      );
    } else {
      await dislikePost(Number(id), profileId);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                isDisliked: true,
                dislikesCount: p.dislikesCount + 1,
                isLiked: false,
                likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount,
              }
            : p,
        ),
      );
    }
  };

  return (
    <div className={styles.feed}>
      <PostSearch onSearch={setSearch} />
      <div className={styles.controls}>
        {(['newest', 'oldest', 'title'] as const).map((s) => (
          <button
            key={s}
            className={`${styles.control} ${sort === s ? styles.control_active : ''}`}
            type="button"
            onClick={() => setSort(s)}
          >
            {s === 'newest' ? 'Новые' : s === 'oldest' ? 'Старые' : 'По заголовку'}
          </button>
        ))}
        <div className={styles.divider} />
        {(['all', 'mine'] as const).map((f) => (
          <button
            key={f}
            className={`${styles.control} ${filter === f ? styles.control_active : ''}`}
            type="button"
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'Все' : 'Мои'}
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
          setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, content } : p)));
        }}
        onDelete={async (id) => {
          await deletePost(Number(id));
          setPosts((prev) => prev.filter((p) => p.id !== id));
        }}
      />
    </div>
  );
}
