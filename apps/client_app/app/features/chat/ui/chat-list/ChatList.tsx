'use client';

import { useState } from 'react';
import type { Chat } from '@/app/entities/chat';
import styles from './ChatList.module.scss';

type ChatListProps = {
  chats: Chat[];
  activeChatId: number | null;
  onSelect: (chat: Chat) => void;
};

function ChatItem({
  chat,
  isActive,
  onSelect,
}: {
  chat: Chat;
  isActive: boolean;
  onSelect: (c: Chat) => void;
}) {
  return (
    <button
      className={`${styles.item} ${isActive ? styles.item_active : ''}`}
      onClick={() => onSelect(chat)}
      type="button"
    >
      <div className={styles.avatar}>
        {chat.avatar ? (
          <img alt="" className={styles.avatarImg} src={chat.avatar} />
        ) : (
          <div className={styles.avatarPlaceholder}>{(chat.name ?? 'Ч').charAt(0)}</div>
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.top}>
          <span className={styles.name}>{chat.name ?? 'Чат'}</span>
          {chat.lastMessage && (
            <span className={styles.time}>
              {new Date(chat.lastMessage.createdAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short',
              })}
            </span>
          )}
        </div>
        <div className={styles.bottom}>
          <span className={styles.preview}>{chat.lastMessage?.content ?? 'Нет сообщений'}</span>
        </div>
      </div>
    </button>
  );
}

export function ChatList({ chats = [], activeChatId = null, onSelect = () => {} }: ChatListProps) {
  const [query, setQuery] = useState('');

  const filtered = chats.filter((chat) =>
    (chat.name ?? '').toLowerCase().includes(query.toLowerCase()),
  );

  const privateChats = filtered.filter((c) => c.type === 'private');
  const groupChats = filtered.filter((c) => c.type === 'group');

  return (
    <aside className={styles.list}>
      <div className={styles.header}>
        <h2 className={styles.title}>Каталог</h2>
      </div>
      <div className={styles.search}>
        <input
          className={styles.searchInput}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по имени..."
          type="text"
          value={query}
        />
      </div>
      <div className={styles.items}>
        {privateChats.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Сообщения</h3>
            {privateChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === activeChatId}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
        {groupChats.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Группы</h3>
            {groupChats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === activeChatId}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
