import {
  Column,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToOne,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Post } from './post.entity';
import { Profile } from './profile.entity';
import { TimestampedEntity } from './base.entity';

@Entity({ name: 'comment', schema: 'main' })
export class Comment extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'post_id', type: 'uuid' })
  postId: string;

  @Column({ name: 'author_profile_id', type: 'uuid' })
  authorProfileId: string;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => Profile, (profile) => profile.comments)
  @JoinColumn({ name: 'author_profile_id' })
  authorProfile: Profile;

  @ManyToMany(() => Profile, (profile) => profile.likedComments)
  @JoinTable({
    name: 'comment_like',
    joinColumn: { name: 'comment_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'profile_id', referencedColumnName: 'id' },
  })
  likes: Profile[];
}
