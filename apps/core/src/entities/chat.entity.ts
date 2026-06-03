import {
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Message } from './message.entity';
import { Profile } from './profile.entity';

@Entity({ name: 'chat', schema: 'main' })
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ManyToMany(() => Profile, (profile) => profile.chats)
  @JoinTable({
    name: 'chat_participant',
    joinColumn: { name: 'chat_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'profile_id', referencedColumnName: 'id' },
  })
  participants: Profile[];

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}
