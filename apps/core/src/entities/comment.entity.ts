import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Post } from './post.entity';
import { Profile } from './profile.entity';

@Entity({ name: 'comment', schema: 'main' })
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'post_id', type: 'int' })
  postId: number;

  @Column({ name: 'author_profile_id', type: 'int' })
  authorProfileId: number;

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

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
