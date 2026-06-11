'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { searchUsers } from '@/app/shared/api/users';
import type { ProfileDto } from '@/app/shared/api/users';
import styles from './HeaderSearch.module.scss';

export function HeaderSearch() {
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState<ProfileDto[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setCandidates([]);
      setIsOpen(false);
      return;
    }
    try {
      const results = await searchUsers(q);
      setCandidates(results.slice(0, 5));
      setIsOpen(results.length > 0);
    } catch {
      setCandidates([]);
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, handleSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(id: number) {
    setIsOpen(false);
    setQuery('');
    setCandidates([]);
    router.push(`/profile/${id}`);
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <input
        className={styles.input}
        type="text"
        placeholder="Поиск пользователей..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (candidates.length > 0) setIsOpen(true);
        }}
      />
      {isOpen && (
        <ul className={styles.dropdown}>
          {candidates.map((user) => (
            <li key={user.id} className={styles.item} onClick={() => handleSelect(user.id!)}>
              <span className={styles.name}>{user.displayName}</span>
              {user.bio && <span className={styles.bio}>{user.bio}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
