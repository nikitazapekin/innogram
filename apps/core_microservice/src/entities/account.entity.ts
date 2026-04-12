import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { TimestampedEntity } from './base.entity';
import { User } from './user.entity';

@Entity({ name: 'account', schema: 'auth' })
export class Account extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  provider: string;

  @Column({ name: 'provider_account_id', type: 'varchar', length: 255 })
  providerAccountId: string;

  @ManyToOne(() => User, (user) => user.accounts)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
