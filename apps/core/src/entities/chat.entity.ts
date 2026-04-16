import { Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Message } from './message.entity';
import { TimestampedEntity } from './base.entity';
import { Profile } from './profile.entity';

@Entity({ name: 'chat', schema: 'main' })
export class Chat extends TimestampedEntity {
  // поудалять везде
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
