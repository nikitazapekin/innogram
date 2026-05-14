'use client';

import { resolveErrorDetails } from '@/app/entities/system-feedback';
import { Modal } from '@/app/shared/ui/modal';
import styles from './ErrorDialog.module.scss';

type ErrorDialogProps = {
  error?: Error & { digest?: string };
  onClose: () => void;
};

export function ErrorDialog({ error, onClose }: ErrorDialogProps) {
  const { description, title } = resolveErrorDetails(error);

  return (
    <Modal
      onClose={onClose}
      showCloseButton={false}
      actions={
        <button className={styles.action} type="button" onClick={onClose}>
          Закрыть
        </button>
      }
      description={description}
      title={title}
    />
  );
}
