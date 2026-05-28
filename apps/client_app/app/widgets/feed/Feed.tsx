'use client';

import { PostList } from '@/app/features/post';
import styles from './Feed.module.scss';

export function Feed() {
  return (
    <div className={styles.feed}>
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${styles.tab_active}`} type="button">
          Новые
        </button>
        <button className={styles.tab} type="button">
          Популярные
        </button>
        <button className={`${styles.tab} ${styles.tab_active}`} type="button">
          Все
        </button>
        <button className={styles.tab} type="button">
          Мои
        </button>
        <button className={styles.tab} type="button">
          Понравившиеся
        </button>
      </div>
      <PostList />
    </div>
  );
}
