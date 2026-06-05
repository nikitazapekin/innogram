'use client';

import { useState } from 'react';
import styles from './PostSearch.module.scss';

type PostSearchProps = { onSearch: (query: string) => void };

export function PostSearch({ onSearch }: PostSearchProps) {
  const [value, setValue] = useState('');
  return (
    <div className={styles.search}>
      <input
        className={styles.input}
        placeholder="Поиск постов..."
        type="text"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onSearch(e.target.value);
        }}
      />
    </div>
  );
}
