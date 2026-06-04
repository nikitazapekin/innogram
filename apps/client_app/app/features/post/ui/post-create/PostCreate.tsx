'use client';

import { useState, useRef } from 'react';
import styles from './PostCreate.module.scss';

type PostCreateProps = { onSubmit: (content: string, file?: File) => Promise<void> };

export function PostCreate({ onSubmit }: PostCreateProps) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!text) return;
    setLoading(true);

    await onSubmit(text, file ?? undefined);
    setText('');
    setFile(null);

    setLoading(false);
  };

  return (
    <div className={styles.form}>
      <h2 className={styles.title}>Создать пост</h2>
      <textarea
        className={styles.textarea}
        placeholder="Что у вас нового?"
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className={styles.toolbar}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button
          className={styles.fileButton}
          type="button"
          onClick={() => inputRef.current?.click()}
        >
          Прикрепить медиа
        </button>
        {file ? <span className={styles.fileName}>{file.name}</span> : null}
      </div>
      <button
        className={styles.submit}
        type="button"
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
      >
        {loading ? 'Публикация...' : 'Опубликовать'}
      </button>
    </div>
  );
}
