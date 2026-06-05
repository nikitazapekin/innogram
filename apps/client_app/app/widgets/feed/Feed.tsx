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
      .then((profile) => {
        const pid = profile?.id;
        if (pid) setProfileId(pid);
      })
      .catch(() => {});
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

    const target = posts.find((post) => post.id === id);
    if (!target) return;

    if (target.isLiked) {
      await unlikePost(Number(id), profileId);

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== id) {
            return post;
          }

          return { ...post, isLiked: false, likesCount: post.likesCount - 1 };
        }),
      );
    } else {
      await likePost(Number(id), profileId);

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== id) {
            return post;
          }

          const updated = {
            ...post,
            isLiked: true,
            likesCount: post.likesCount + 1,
            isDisliked: false,
            dislikesCount: post.dislikesCount,
          };

          if (post.isDisliked) {
            updated.dislikesCount = post.dislikesCount - 1;
          }

          return updated;
        }),
      );
    }
  };

  const handleDislike = async (id: string) => {
    if (!profileId) return;

    const target = posts.find((post) => post.id === id);
    if (!target) return;

    if (target.isDisliked) {
      await undislikePost(Number(id), profileId);

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== id) {
            return post;
          }

          return { ...post, isDisliked: false, dislikesCount: post.dislikesCount - 1 };
        }),
      );
    } else {
      await dislikePost(Number(id), profileId);

      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== id) {
            return post;
          }

          const updated = {
            ...post,
            isDisliked: true,
            dislikesCount: post.dislikesCount + 1,
            isLiked: false,
            likesCount: post.likesCount,
          };

          if (post.isLiked) {
            updated.likesCount = post.likesCount - 1;
          }

          return updated;
        }),
      );
    }
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
      />
    </div>
  );
}
