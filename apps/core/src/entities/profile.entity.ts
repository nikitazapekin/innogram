import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Chat } from './chat.entity';
import { Comment } from './comment.entity';
import { Post } from './post.entity';

@Entity({ name: 'profile', schema: 'main' })
export class Profile {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'display_name', type: 'varchar', length: 120 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ name: 'avatar_asset_id', type: 'integer', nullable: true })
  avatarAssetId: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToMany(() => Chat, (chat) => chat.participants)
  chats: Chat[];

  @ManyToMany(() => Profile, (profile) => profile.followers)
  @JoinTable({
    name: 'profile_follow',
    joinColumn: { name: 'follower_profile_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'following_profile_id', referencedColumnName: 'id' },
  })
  followingProfiles: Profile[];

  @ManyToMany(() => Profile, (profile) => profile.followingProfiles)
  followers: Profile[];

  @ManyToMany(() => Profile, (profile) => profile.incomingConfigurations)
  @JoinTable({
    name: 'profile_to_profile_configuration',
    joinColumn: { name: 'source_profile_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'target_profile_id', referencedColumnName: 'id' },
  })
  outgoingConfigurations: Profile[];

  @ManyToMany(() => Profile, (profile) => profile.outgoingConfigurations)
  incomingConfigurations: Profile[];

  @ManyToMany(() => Post, (post) => post.likes)
  likedPosts: Post[];

  @ManyToMany(() => Comment, (comment) => comment.likes)
  likedComments: Comment[];
}
