'use client';

import type { User } from '@/app/entities/user';
import { ProfileHeader } from '@/app/features/profile';
import { PostList } from '@/app/features/post';
import styles from './Profile.module.scss';

const demoUser: User = {
  id: '1',
  name: 'Анна Иванова',
  email: 'anna@example.com',
  bio: 'Фотограф и путешественник. Люблю кофе и долгие прогулки.',
  isPrivate: false,
  postsCount: 14,
  followersCount: 128,
  followingCount: 89,
  isFollowed: false,
  isFollowing: false,
  hasFollowRequest: false,
};

export function Profile() {
  return (
    <div className={styles.profile}>
      <ProfileHeader user={demoUser} isOwn />
      <PostList />
    </div>
  );
}
