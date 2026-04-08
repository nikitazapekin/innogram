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

import { Chat } from './chat.entity';
import { Asset } from './asset.entity';
import { Profile } from './profile.entity';
import { TimestampedEntity } from './base.entity';

@Entity({ name: 'message', schema: 'main' })
export class Message extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'chat_id', type: 'uuid' })
  chatId: string;

  @Index()
  @Column({ name: 'author_profile_id', type: 'uuid' })
  authorProfileId: string;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @ManyToOne(() => Chat, (chat) => chat.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @ManyToOne(() => Profile, (profile) => profile.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_profile_id' })
  authorProfile: Profile;

  @ManyToMany(() => Asset, (asset) => asset.messages)
  @JoinTable({
    name: 'message_asset',
    joinColumn: { name: 'message_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'asset_id', referencedColumnName: 'id' },
  })
  assets: Asset[];
}
