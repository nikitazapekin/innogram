import { ReactNode } from 'react';
import styles from './Modal.module.scss';

type ModalProps = {
  actions?: ReactNode;
  children?: ReactNode;
  description?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  title: string;
};

export function Modal({
  actions,
  children,
  description,
  onClose,
  showCloseButton = true,
  title,
}: ModalProps) {
  return (
    <div className={styles.overlay}>
      <div
        aria-labelledby="app-modal-title"
        aria-modal="true"
        className={styles.dialog}
        role="dialog"
      >
        <div className={styles.header}>
          <div className={styles.heading}>
            <h2 className={styles.title} id="app-modal-title">
              {title}
            </h2>
            {onClose && showCloseButton ? (
              <button
                aria-label="Закрыть модальное окно"
                className={styles.close}
                type="button"
                onClick={onClose}
              >
                Закрыть
              </button>
            ) : null}
          </div>
          {description ? <p className={styles.description}>{description}</p> : null}
        </div>

        {children ? <div className={styles.body}>{children}</div> : null}
        {actions ? <div className={styles.footer}>{actions}</div> : null}
      </div>
    </div>
  );
}
