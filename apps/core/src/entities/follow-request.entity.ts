import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Profile } from './profile.entity';

export enum FollowRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity({ name: 'follow_request', schema: 'main' })
export class FollowRequest {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'follower_profile_id', type: 'integer' })
  followerProfileId: number;

  @Column({ name: 'following_profile_id', type: 'integer' })
  followingProfileId: number;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'follower_profile_id' })
  followerProfile: Profile;

  @ManyToOne(() => Profile)
  @JoinColumn({ name: 'following_profile_id' })
  followingProfile: Profile;

  @Column({ type: 'varchar', length: 20, default: FollowRequestStatus.PENDING })
  status: FollowRequestStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
