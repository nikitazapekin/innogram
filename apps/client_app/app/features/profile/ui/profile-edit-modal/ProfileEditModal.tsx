'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/app/shared/ui/modal';
import { InputField } from '@/app/shared/ui/input';
import { RequestLoader } from '@/app/features/system-feedback';
import { updateProfile } from '@/app/shared/api/users';
import styles from './ProfileEditModal.module.scss';

type ProfileEditModalProps = {
  onClose: () => void;
  onProfileUpdate?: (data: { displayName: string; bio?: string }) => void;
  user: {
    displayName: string;
    bio?: string;
  };
};

export function ProfileEditModal({ onClose, onProfileUpdate, user }: ProfileEditModalProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio ?? '');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ displayName?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!displayName.trim()) {
      setFieldErrors({ displayName: 'Имя не может быть пустым' });
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProfile({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
      });
      onProfileUpdate?.({
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
      });
      router.refresh();
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Произошла ошибка');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal onClose={onClose} title="Редактировать профиль">
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        {error ? <p className={styles.apiError}>{error}</p> : null}

        <InputField
          error={fieldErrors.displayName}
          label="Имя"
          name="displayName"
          placeholder="Ваше имя"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        <label className={styles.field}>
          <span className={styles.label}>О себе</span>
          <textarea
            className={styles.textarea}
            name="bio"
            placeholder="Расскажите о себе"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </label>

        <div className={styles.actions}>
          <button className={styles.cancelButton} type="button" onClick={onClose}>
            Отмена
          </button>
          <button className={styles.saveButton} type="submit" disabled={isSubmitting}>
            {isSubmitting ? <RequestLoader inline label="Сохранение" /> : 'Сохранить'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
