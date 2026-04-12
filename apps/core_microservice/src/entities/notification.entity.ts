import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Profile } from './profile.entity';
import { TimestampedEntity } from './base.entity';

@Entity({ name: 'notification', schema: 'notification' })
export class Notification extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'recipient_profile_id', type: 'uuid' })
  recipientProfileId: string;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown> | null;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @ManyToOne(() => Profile, (profile) => profile.notifications)
  @JoinColumn({ name: 'recipient_profile_id' })
  recipientProfile: Profile;
}
