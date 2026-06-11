'use client';

import { useState } from 'react';
import styles from './CommentForm.module.scss';

type CommentFormProps = {
  onSubmit: (text: string) => Promise<void>;
  placeholder?: string;
  initialValue?: string;
  submitLabel?: string;
  onCancel?: () => void;
};

export function CommentForm({
  onSubmit,
  placeholder = 'Написать комментарий...',
  initialValue = '',
  submitLabel = 'Отправить',
  onCancel,
}: CommentFormProps) {
  const [text, setText] = useState(initialValue);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(text.trim());
      setText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.form}>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={2}
      />
      <div className={styles.actions}>
        <button
          className={styles.submit}
          type="button"
          onClick={handleSubmit}
          disabled={!text.trim() || submitting}
        >
          {submitting ? '...' : submitLabel}
        </button>
        {onCancel && (
          <button className={styles.cancel} type="button" onClick={onCancel}>
            Отмена
          </button>
        )}
      </div>
    </div>
  );
}
