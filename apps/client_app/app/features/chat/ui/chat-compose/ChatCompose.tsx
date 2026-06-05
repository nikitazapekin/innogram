'use client';

import { FormEvent, KeyboardEvent, useRef, useState } from 'react';
import styles from './ChatCompose.module.scss';

type ChatComposeProps = {
  onSend: (content: string, files: File[]) => void | Promise<void>;
  disabled?: boolean;
};

export function ChatCompose({ onSend, disabled = false }: ChatComposeProps) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event?: FormEvent) => {
    event?.preventDefault();

    const trimmed = text.trim();
    if ((!trimmed && files.length === 0) || disabled || isSending) {
      return;
    }

    setIsSending(true);
    try {
      await onSend(trimmed, files);
      setText('');
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    if (selected.length > 0) {
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form className={styles.compose} onSubmit={handleSubmit}>
      {files.length > 0 && (
        <div className={styles.preview}>
          {files.map((file, index) => (
            <div key={`${file.name}-${index}`} className={styles.previewItem}>
              {file.type.startsWith('image/') ? (
                <img
                  alt={file.name}
                  className={styles.previewImage}
                  src={URL.createObjectURL(file)}
                />
              ) : (
                <div className={styles.previewFile}>
                  <span className={styles.previewName}>{file.name}</span>
                </div>
              )}
              <button
                className={styles.previewRemove}
                onClick={() => removeFile(index)}
                type="button"
                aria-label="Удалить файл"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className={styles.inputRow}>
        <input
          ref={fileInputRef}
          accept="image/*,.pdf,.doc,.docx,.txt"
          className={styles.fileInput}
          disabled={disabled || isSending}
          multiple
          onChange={handleFileChange}
          type="file"
        />
        <button
          className={styles.attachButton}
          disabled={disabled || isSending}
          onClick={() => fileInputRef.current?.click()}
          title="Прикрепить файл"
          type="button"
        >
          <img alt="Прикрепить файл" className={styles.attachIcon} src="/folder.png" />
        </button>
        <textarea
          className={styles.input}
          disabled={disabled || isSending}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Написать сообщение..."
          rows={1}
          value={text}
        />
        <button
          className={styles.sendButton}
          disabled={disabled || isSending || (!text && files.length === 0)}
          type="submit"
        >
          {isSending ? '…' : 'Отправить'}
        </button>
      </div>
    </form>
  );
}
