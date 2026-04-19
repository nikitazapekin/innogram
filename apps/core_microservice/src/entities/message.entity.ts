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

import { Chat } from './chat.entity';
import { Asset } from './asset.entity';
import { Profile } from './profile.entity';

@Entity({ name: 'message', schema: 'main' })
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'chat_id', type: 'int' })
  chatId: number;

  @Column({ name: 'author_profile_id', type: 'int' })
  authorProfileId: number;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @ManyToOne(() => Chat, (chat) => chat.messages)
  @JoinColumn({ name: 'chat_id' })
  chat: Chat;

  @ManyToOne(() => Profile, (profile) => profile.messages)
  @JoinColumn({ name: 'author_profile_id' })
  authorProfile: Profile;

  @ManyToMany(() => Asset, (asset) => asset.messages)
  @JoinTable({
    name: 'message_asset',
    joinColumn: { name: 'message_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'asset_id', referencedColumnName: 'id' },
  })
  assets: Asset[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}
