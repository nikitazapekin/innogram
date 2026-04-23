import {
  Column,
  Entity,
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

  @Column({ name: 'chat_id', type: 'uuid' })
  chatId: string;

  @Column({ name: 'author_profile_id', type: 'uuid' })
  authorProfileId: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @ManyToMany(() => Asset, (asset) => asset.messages)
  @JoinTable({
    name: 'message_asset',
    joinColumn: { name: 'message_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'asset_id', referencedColumnName: 'id' },
  })
  assets: Asset[];
}
