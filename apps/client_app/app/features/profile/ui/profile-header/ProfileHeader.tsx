'use client';

import type { User } from '@/app/entities/user';
import styles from './ProfileHeader.module.scss';

type ProfileHeaderProps = { user: User; isOwn?: boolean };

export function ProfileHeader({ user, isOwn = false }: ProfileHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.avatar}>
        {user.avatar ? (
          <img alt="" className={styles.avatarImg} src={user.avatar} />
        ) : (
          <div className={styles.avatarPlaceholder}>{user.name.charAt(0)}</div>
        )}
      </div>
      <div className={styles.info}>
        <h1 className={styles.name}>{user.name}</h1>
        {user.bio ? <p className={styles.bio}>{user.bio}</p> : null}
        <div className={styles.stats}>
          <span className={styles.stat}>
            <strong>{user.postsCount}</strong> постов
          </span>
          <span className={styles.stat}>
            <strong>{user.followersCount}</strong> подписчиков
          </span>
          <span className={styles.stat}>
            <strong>{user.followingCount}</strong> подписок
          </span>
        </div>
        <div className={styles.actions}>
          {isOwn ? (
            <button className={styles.editButton} type="button">
              Редактировать профиль
            </button>
          ) : (
            <>
              <button className={styles.followButton} type="button">
                {user.isFollowed ? 'Отписаться' : 'Подписаться'}
              </button>
              {user.isPrivate && !user.isFollowed ? (
                <button className={styles.requestButton} type="button">
                  {user.hasFollowRequest ? 'Запрос отправлен' : 'Запросить подписку'}
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
