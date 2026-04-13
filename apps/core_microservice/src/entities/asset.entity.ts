import { Column, Entity, JoinColumn, ManyToOne, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Message } from './message.entity';
import { Post } from './post.entity';
import { Profile } from './profile.entity';
import { TimestampedEntity } from './base.entity';

@Entity({ name: 'asset', schema: 'main' })
export class Asset extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'owner_profile_id', type: 'uuid', nullable: true })
  ownerProfileId!: string;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 255 })
  mimeType: string;

  @Column({ name: 'storage_key', type: 'varchar', length: 512 })
  storageKey: string;

  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes: string;

  @ManyToOne(() => Profile, { nullable: true })
  @JoinColumn({ name: 'owner_profile_id' })
  ownerProfile: Profile;

  @ManyToMany(() => Post, (post) => post.assets)
  posts: Post[];

  @ManyToMany(() => Message, (message) => message.assets)
  messages: Message[];
}
