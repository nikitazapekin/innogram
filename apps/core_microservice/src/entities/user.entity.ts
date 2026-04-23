import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Account } from './account.entity';
import { TimestampedEntity } from './base.entity';

@Entity({ name: 'user', schema: 'auth' })
export class UserEntity extends TimestampedEntity {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 320 })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];
}
