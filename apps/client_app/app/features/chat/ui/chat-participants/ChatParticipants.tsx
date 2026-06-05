'use client';

import { FormEvent, useState } from 'react';
import type { ChatParticipant } from '@/app/entities/chat';
import type { ProfileDto } from '@/app/shared/api/users';
import styles from './ChatParticipants.module.scss';

type ChatParticipantsProps = {
  participants: ChatParticipant[];
  currentProfileId: number;
  isGroup?: boolean;
  profiles?: ProfileDto[];
  onAddParticipant?: (profileId: number) => void;
};

export function ChatParticipants({
  participants = [],
  currentProfileId,
  isGroup = false,
  profiles = [],
  onAddParticipant,
}: ChatParticipantsProps) {
  const [newProfileId, setNewProfileId] = useState('');

  const handleAdd = (event: FormEvent) => {
    event.preventDefault();
    const id = Number(newProfileId);
    if (!id || !onAddParticipant) return;
    onAddParticipant(id);
    setNewProfileId('');
  };

  const availableProfiles = profiles.filter(
    (profile) =>
      profile.id &&
      profile.id !== currentProfileId &&
      !participants.some((part) => part.profileId === profile.id),
  );

  return (
    <div className={styles.participants}>
      <h3 className={styles.title}>Участники</h3>
      {isGroup && onAddParticipant && (
        <form className={styles.addForm} onSubmit={handleAdd}>
          <select
            className={styles.select}
            onChange={(e) => setNewProfileId(e.target.value)}
            value={newProfileId}
          >
            <option value="">Добавить участника…</option>
            {availableProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.displayName ?? `Профиль ${profile.id}`}
              </option>
            ))}
          </select>
          <button className={styles.addButton} disabled={!newProfileId} type="submit">
            +
          </button>
        </form>
      )}
      <div className={styles.list}>
        {participants.length === 0 && (
          <p className={styles.empty}>{isGroup ? 'Участники загружаются…' : 'Личный чат'}</p>
        )}
        {participants.map((participant) => {
          const isOwner = participant.role === 'owner';
          const isOwn = participant.profileId === currentProfileId;
          return (
            <div key={participant.id} className={styles.item}>
              <div className={styles.avatar}>
                {participant.avatar ? (
                  <img alt="" className={styles.avatarImg} src={participant.avatar} />
                ) : (
                  <div className={styles.avatarPlaceholder}>{participant.name.charAt(0)}</div>
                )}
              </div>
              <div className={styles.body}>
                <span className={styles.name}>
                  {participant.name}
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
