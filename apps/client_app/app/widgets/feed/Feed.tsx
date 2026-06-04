'use client';

import { useEffect, useState, useCallback } from 'react';
import styles from './Feed.module.scss';
import { PostSearch } from '@/app/features/post/ui/post-search/PostSearch';
import { PostCreate } from '@/app/features/post/ui/post-create/PostCreate';
import { PostList } from '@/app/features/post/ui/post-list/PostList';
import { getPosts, createPost, updatePost, deletePost } from '@/app/shared/api/posts';
import type { Post } from '@/app/entities/post';

type SortMode = 'newest' | 'oldest' | 'title';
type FilterMode = 'all' | 'mine';

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState<SortMode>('newest');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [search, setSearch] = useState('');

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

  const handleCreate = async (content: string) => {
    const created = await createPost(content);
    setPosts((prev) => [created, ...prev]);
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
