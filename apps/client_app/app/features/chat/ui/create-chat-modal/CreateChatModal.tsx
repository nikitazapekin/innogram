'use client';

import { FormEvent, useState } from 'react';
import { Modal } from '@/app/shared/ui/modal';
import type { ProfileDto } from '@/app/shared/api/users';
import styles from './CreateChatModal.module.scss';

type CreateChatModalProps = {
  mode: 'private' | 'group';
  profiles: ProfileDto[];
  currentProfileId: number;
  onClose: () => void;
  onCreatePrivate: (targetProfileId: number) => void;
  onCreateGroup: (participantIds: number[]) => void;
};

export function CreateChatModal({
  mode,
  profiles,
  currentProfileId,
  onClose,
  onCreatePrivate,
  onCreateGroup,
}: CreateChatModalProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const others = profiles.filter((profile) => profile.id && profile.id !== currentProfileId);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (mode === 'private' && selectedId) {
      onCreatePrivate(selectedId);
      onClose();
      return;
    }

    if (mode === 'group' && selectedIds.length > 0) {
      onCreateGroup(selectedIds);
      onClose();
    }
  };

  const toggleGroupMember = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <Modal
      description={
        mode === 'private'
          ? 'Выберите пользователя для личного чата'
          : 'Выберите участников группового чата'
      }
      onClose={onClose}
      title={mode === 'private' ? 'Новый чат' : 'Новая группа'}
      actions={
        <button
          className={styles.submit}
          disabled={mode === 'private' ? !selectedId : selectedIds.length === 0}
          form="create-chat-form"
          type="submit"
        >
          Создать
        </button>
      }
    >
      <form className={styles.form} id="create-chat-form" onSubmit={handleSubmit}>
        {mode === 'private' ? (
          <ul className={styles.list}>
            {others.map((profile) => (
              <li key={profile.id}>
                <label className={styles.option}>
                  <input
                    checked={selectedId === profile.id}
                    name="privateTarget"
                    onChange={() => setSelectedId(profile.id!)}
                    type="radio"
                  />
                  <span>{profile.displayName ?? `Профиль ${profile.id}`}</span>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <ul className={styles.list}>
            {others.map((profile) => (
              <li key={profile.id}>
                <label className={styles.option}>
                  <input
                    checked={selectedIds.includes(profile.id!)}
                    onChange={() => toggleGroupMember(profile.id!)}
                    type="checkbox"
                  />
                  <span>{profile.displayName ?? `Профиль ${profile.id}`}</span>
                </label>
              </li>
            ))}
          </ul>
        )}
        {others.length === 0 && <p className={styles.empty}>Нет доступных профилей</p>}
      </form>
    </Modal>
  );
}
