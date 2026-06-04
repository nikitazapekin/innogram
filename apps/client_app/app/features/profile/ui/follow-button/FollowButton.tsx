'use client';

import styles from './FollowButton.module.scss';

type FollowButtonProps = {
  isFollowed: boolean;
  isPrivate?: boolean;
  hasRequest?: boolean;
};

export function FollowButton({
  isFollowed,
  isPrivate = false,
  hasRequest = false,
}: FollowButtonProps) {
  if (isPrivate && !isFollowed) {
    return (
      <button className={styles.request} type="button">
        {hasRequest ? 'Запрос отправлен' : 'Подписаться'}
      </button>
    );
  }

  return (
    <button className={`${styles.button} ${isFollowed ? styles.button_active : ''}`} type="button">
      {isFollowed ? 'Отписаться' : 'Подписаться'}
    </button>
  );
}
