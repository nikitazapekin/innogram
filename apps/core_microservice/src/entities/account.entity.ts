import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TimestampedEntity } from './base.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'account', schema: 'auth' })
export class Account extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'integer' })
  userId: number;

  @ManyToOne(() => UserEntity, (user) => user.accounts)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
