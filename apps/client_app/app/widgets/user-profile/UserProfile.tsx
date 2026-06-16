'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { ProfileDto } from '@/app/shared/api/users';
import {
  getUserProfile,
  getProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getUserPosts,
} from '@/app/shared/api/users';
import { PostList } from '@/app/features/post';
import type { Post } from '@/app/entities/post';
import styles from './UserProfile.module.scss';

type UserProfileProps = {
  userId: number;
};

export function UserProfile({ userId }: UserProfileProps) {
  const [user, setUser] = useState<ProfileDto | null>(null);
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null);
  const [isFollowed, setIsFollowed] = useState(false);
  const [followers, setFollowers] = useState<ProfileDto[]>([]);
  const [following, setFollowing] = useState<ProfileDto[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const [profileData, myProfile, followersData, followingData] = await Promise.all([
        getUserProfile(userId),
        getProfile().catch(() => null),
        getFollowers(userId),
        getFollowing(userId),
      ]);

      const myProfileId = myProfile?.id ?? null;

      setUser(profileData);
      setCurrentProfileId(myProfileId);
      setFollowers(followersData);
      setFollowing(followingData);
      setIsFollowed(followersData.some((p: ProfileDto) => p.id === myProfileId));

      try {
        const userPosts = await getUserPosts(userId);
        setPosts(userPosts);
      } catch {
        setPosts([]);
      }
    } catch {
      router.push('/404');
    } finally {
      setLoading(false);
    }
  }, [userId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleFollow() {
    if (!currentProfileId || !user || !user.id) return;

    await followUser(currentProfileId, user.id);
    setIsFollowed(true);
  }

  async function handleUnfollow() {
    if (!currentProfileId || !user || !user.id) return;

    await unfollowUser(currentProfileId, user.id);
    setIsFollowed(false);
  }

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  if (!user) {
    return <div className={styles.loading}>Пользователь не найден</div>;
  }

  const isOwnProfile = !!(currentProfileId && user.id && currentProfileId === user.id);

  return (
    <div className={styles.profile}>
      <div className={styles.header}>
        <div className={styles.avatar}>
          <div className={styles.avatarPlaceholder}>{(user.displayName || '?').charAt(0)}</div>
        </div>
        <div className={styles.info}>
          <h1 className={styles.name}>{user.displayName || 'Без имени'}</h1>
          {user.bio ? <p className={styles.bio}>{user.bio}</p> : null}
        </div>
      </div>

      {currentProfileId && !isOwnProfile && (
        <div className={styles.actions}>
          {isFollowed ? (
            <button className={styles.unfollowBtn} onClick={handleUnfollow} type="button">
              Отписаться
            </button>
          ) : (
            <button className={styles.followBtn} onClick={handleFollow} type="button">
              Подписаться
            </button>
          )}
        </div>
      )}

      <div className={styles.stats}>
        <button className={styles.statBtn} onClick={() => setShowFollowers(true)} type="button">
          <strong>{followers.length}</strong> подписчиков
        </button>
        <button className={styles.statBtn} onClick={() => setShowFollowing(true)} type="button">
          <strong>{following.length}</strong> подписок
        </button>
      </div>

      {showFollowers && (
        <ModalList title="Подписчики" items={followers} onClose={() => setShowFollowers(false)} />
      )}
      {showFollowing && (
        <ModalList title="Подписки" items={following} onClose={() => setShowFollowing(false)} />
      )}

      <div className={styles.sectionTitle}>Посты</div>
      <PostList posts={posts} />
    </div>
  );
}

function ModalList({
  title,
  items,
  onClose,
}: {
  title: string;
  items: ProfileDto[];
  onClose: () => void;
}) {
  const router = useRouter();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            ✕
          </button>
        </div>
        <ul className={styles.modalList}>
          {items.length === 0 && <li className={styles.modalEmpty}>Нет пользователей</li>}
          {items.map((item) => (
            <li
              key={item.id}
              className={styles.modalItem}
              onClick={() => {
                onClose();
                router.push(`/profile/${item.id}`);
              }}
            >
              <div className={styles.modalAvatar}>{item.displayName?.charAt(0)}</div>
              <span>{item.displayName}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
