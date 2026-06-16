'use client';

import { useState } from 'react';
import type { User } from '@/app/entities/user';
import { clearAccessToken } from '@/lib/auth';
import { ProfileEditModal } from '@/app/features/profile/ui/profile-edit-modal';
import styles from './ProfileHeader.module.scss';

type ProfileHeaderProps = {
  user: User;
  onProfileUpdate?: (data: { displayName: string; bio?: string }) => void;
};

export function ProfileHeader({ user, onProfileUpdate }: ProfileHeaderProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  const handleLogout = () => {
    void clearAccessToken().finally(() => {
      window.location.assign('/login');
    });
  };

  return (
    <>
      <div className={styles.header}>
        <div className={styles.avatar}>
          <div className={styles.avatarPlaceholder}>{user.displayName.charAt(0)}</div>
        </div>
        <div className={styles.info}>
          <h1 className={styles.name}>{user.displayName}</h1>
          {user.bio ? <p className={styles.bio}>{user.bio}</p> : null}
          {user.email ? <p className={styles.email}>{user.email}</p> : null}
          <div className={styles.actions}>
            <button
              className={styles.editButton}
              type="button"
              onClick={() => setShowEditModal(true)}
            >
              Редактировать профиль
            </button>
            <button className={styles.logoutButton} type="button" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </div>
      </div>

      {showEditModal ? (
        <ProfileEditModal
          user={user}
          onClose={() => setShowEditModal(false)}
          onProfileUpdate={onProfileUpdate}
        />
      ) : null}
    </>
  );
}
