'use client';

import styles from './PostCreate.module.scss';

export function PostCreate() {
  return (
    <div className={styles.form}>
      <h2 className={styles.title}>Создать пост</h2>
      <textarea className={styles.textarea} placeholder="Что у вас нового?" rows={3} />
      <div className={styles.toolbar}>
        <button className={styles.fileButton} type="button">
          Прикрепить медиа
        </button>
      </div>
      <button className={styles.submit} type="button">
        Опубликовать
      </button>
    </div>
  );
}
