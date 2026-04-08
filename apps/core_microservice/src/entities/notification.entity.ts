import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Profile } from './profile.entity';
import { TimestampedEntity } from './base.entity';

@Entity({ name: 'notification', schema: 'notification' })
export class Notification extends TimestampedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'recipient_profile_id', type: 'uuid' })
  recipientProfileId: string;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown> | null;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date;

  @ManyToOne(() => Profile, (profile) => profile.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_profile_id' })
  recipientProfile: Profile;
}
