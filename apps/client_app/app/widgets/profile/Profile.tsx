import type { User } from '@/app/entities/user';
import { ProfileHeader } from '@/app/features/profile';
import { PostList } from '@/app/features/post';
import styles from './Profile.module.scss';

type ProfileProps = { user: User };

export function Profile({ user }: ProfileProps) {
  return (
    <div className={styles.profile}>
      <ProfileHeader user={user} />
      <PostList />
    </div>
  );
}
