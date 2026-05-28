'use client';

import type { ChatParticipant } from '@/app/entities/chat';
import styles from './ChatParticipants.module.scss';

type ChatParticipantsProps = {
  participants: ChatParticipant[];
  currentProfileId: number;
};

export function ChatParticipants({ participants = [], currentProfileId }: ChatParticipantsProps) {
  return (
    <div className={styles.participants}>
      <h3 className={styles.title}>Участники</h3>
      <div className={styles.list}>
        {participants.map((p) => {
          const isOwner = p.role === 'owner';
          const isOwn = p.profileId === currentProfileId;
          return (
            <div key={p.id} className={styles.item}>
              <div className={styles.avatar}>
                {p.avatar ? (
                  <img alt="" className={styles.avatarImg} src={p.avatar} />
                ) : (
                  <div className={styles.avatarPlaceholder}>{p.name.charAt(0)}</div>
                )}
              </div>
              <div className={styles.body}>
                <span className={styles.name}>
                  {p.name}
                  {isOwn && <span className={styles.you}>(вы)</span>}
                </span>
                {isOwner && <span className={styles.role}>Создатель</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
