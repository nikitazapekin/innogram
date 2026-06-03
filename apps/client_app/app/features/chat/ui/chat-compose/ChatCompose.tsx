'use client';

import styles from './ChatCompose.module.scss';

type ChatComposeProps = {
  onSend: (content: string, files: File[]) => void;
  disabled?: boolean;
};

export function ChatCompose({ disabled = false }: ChatComposeProps) {
  return (
    <div className={styles.compose}>
      <div className={styles.inputRow}>
        <button
          className={styles.attachButton}
          disabled={disabled}
          title="Прикрепить файл"
          type="button"
        >
          <img alt="Прикрепить файл" className={styles.attachIcon} src="/folder.png" />
        </button>
        <textarea
          className={styles.input}
          disabled={disabled}
          placeholder="Написать сообщение..."
          rows={1}
        />
        <button className={styles.sendButton} disabled={disabled} type="button">
          Отправить
        </button>
      </div>
    </div>
  );
}
