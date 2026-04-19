import {
  Column,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  JoinTable,
  ManyToOne,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Comment } from './comment.entity';
import { Message } from './message.entity';
import { Notification } from './notification.entity';
import { Post } from './post.entity';

import { User } from './user.entity';
import { Asset } from './asset.entity';
import { Chat } from './chat.entity';

@Entity({ name: 'profile', schema: 'main' })
export class Profile {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @Column({ name: 'display_name', type: 'varchar', length: 120 })
  displayName: string;

  @Column({ type: 'text', nullable: true })
  bio: string | null;

  @Column({ name: 'avatar_asset_id', type: 'integer', nullable: true })
  avatarAssetId: number | null;

  @ManyToOne(() => User, (user) => user.profiles)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Asset, { nullable: true })
  @JoinColumn({ name: 'avatar_asset_id' })
  avatarAsset: Asset | null;

  @OneToMany(() => Post, (post) => post.authorProfile)
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.authorProfile)
  comments: Comment[];

  @OneToMany(() => Message, (message) => message.authorProfile)
  messages: Message[];

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
  outgoingConfigurations!: Profile[];

  @ManyToMany(() => Profile, (profile) => profile.outgoingConfigurations)
  incomingConfigurations!: Profile[];

  @ManyToMany(() => Post, (post) => post.likes)
  likedPosts: Post[];

  @ManyToMany(() => Comment, (comment) => comment.likes)
  likedComments: Comment[];

  @OneToMany(() => Notification, (notification) => notification.recipientProfile)
  notifications: Notification[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
