import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToOne,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Comment } from './comment.entity';
import { Asset } from './asset.entity';
import { Profile } from './profile.entity';
import { TimestampedEntity } from './base.entity';

@Entity({ name: 'post', schema: 'main' })
export class Post extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'author_profile_id', type: 'uuid' })
  authorProfileId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Profile, (profile) => profile.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_profile_id' })
  authorProfile!: Profile;

  @ManyToMany(() => Asset, (asset) => asset.posts)
  @JoinTable({
    name: 'post_asset',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'asset_id', referencedColumnName: 'id' },
  })
  assets: Asset[];

  @ManyToMany(() => Profile, (profile) => profile.likedPosts)
  @JoinTable({
    name: 'post_like',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'profile_id', referencedColumnName: 'id' },
  })
  likes: Profile[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];
}
