'use client';

import type { MediaItem } from '@/app/entities/post';
import styles from './PostGallery.module.scss';

type PostGalleryProps = { items: MediaItem[]; startIndex?: number; onClose: () => void };

export function PostGallery({ items, startIndex = 0, onClose }: PostGalleryProps) {
  const current = items[startIndex];
  if (!current) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} type="button" onClick={onClose}>
          &times;
        </button>
        {items.length > 1 ? (
          <>
            <button className={`${styles.nav} ${styles.nav_prev}`} type="button">
              &larr;
            </button>
            <button className={`${styles.nav} ${styles.nav_next}`} type="button">
              &rarr;
            </button>
          </>
        ) : null}
        {current.type === 'video' ? (
          <video className={styles.media} controls src={current.url} />
        ) : (
          <img alt="" className={styles.media} src={current.url} />
        )}
      </div>
      <div className={styles.counter}>
        {startIndex + 1} / {items.length}
      </div>
    </div>
  );
}
