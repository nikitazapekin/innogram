'use client';

import styles from './Feed.module.scss';
import { PostSearch } from '@/app/features/post/ui/post-search/PostSearch';
import { PostCreate } from '@/app/features/post/ui/post-create/PostCreate';
import { PostList } from '@/app/features/post/ui/post-list/PostList';

export function Feed() {
  return (
    <div className={styles.feed}>
      <PostSearch />
      <div className={styles.controls}>
        <button className={`${styles.control} ${styles.control_active}`} type="button">
          Новые
        </button>
        <button className={styles.control} type="button">
          Популярные
        </button>
        <button className={`${styles.control} ${styles.control_active}`} type="button">
          Все
        </button>
        <button className={styles.control} type="button">
          Мои
        </button>
        <button className={styles.control} type="button">
          Понравившиеся
        </button>
      </div>
      <PostCreate />
      <PostList />
    </div>
  );
}
