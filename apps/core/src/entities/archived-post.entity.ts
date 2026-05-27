import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Post } from './post.entity';

@Entity({ name: 'archived_post', schema: 'main' })
export class ArchivedPost {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'post_id', type: 'integer' })
  postId: number;

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  isArchived: boolean;

  @CreateDateColumn({ name: 'archived_at', type: 'timestamptz' })
  archivedAt: Date;

  @OneToOne(() => Post, (post) => post.archivedPost)
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
