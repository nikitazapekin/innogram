'use client';

import type { User } from '@/app/entities/user';
import styles from './ProfileHeader.module.scss';

type ProfileHeaderProps = { user: User };

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className={styles.header}>
      <div className={styles.avatar}>
        <div className={styles.avatarPlaceholder}>{user.displayName.charAt(0)}</div>
      </div>
      <div className={styles.info}>
        <h1 className={styles.name}>{user.displayName}</h1>
        {user.bio ? <p className={styles.bio}>{user.bio}</p> : null}
        {user.email ? <p className={styles.email}>{user.email}</p> : null}
        <div className={styles.actions}>
          <button className={styles.editButton} type="button">
            Редактировать профиль
          </button>
        </div>
      </div>
    </div>
  );
}
