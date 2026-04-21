import { Column, Entity, JoinColumn, ManyToOne, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Message } from './message.entity';
import { Post } from './post.entity';
import { Profile } from './profile.entity';
import { TimestampedEntity } from './base.entity';

@Entity({ name: 'asset', schema: 'main' })
export class Asset extends TimestampedEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'owner_profile_id', type: 'integer', nullable: true })
  ownerProfileId!: number;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 255 })
  mimeType: string;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'owner_profile_id' })
  ownerProfile!: Profile;

  @ManyToMany(() => Post, (post) => post.assets)
  posts!: Post[];

  @ManyToMany(() => Message, (message) => message.assets)
  messages!: Message[];
}
