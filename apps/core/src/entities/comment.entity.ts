import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Post } from './post.entity';
import { Profile } from './profile.entity';

@Entity({ name: 'comment', schema: 'main' })
export class Comment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'post_id', type: 'integer' })
  postId: number;

  @Column({ name: 'author_profile_id', type: 'integer' })
  authorProfileId: number;

  @Column({ name: 'parent_id', type: 'integer' })
  parentId: number;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => Comment, (comment) => comment.children)
  @JoinColumn({ name: 'parent_id' })
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  children: Comment[];

  @ManyToMany(() => Profile, (profile) => profile.likedComments)
  @JoinTable({
    name: 'comment_like',
    joinColumn: { name: 'comment_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'profile_id', referencedColumnName: 'id' },
  })
  likes: Profile[];
}
