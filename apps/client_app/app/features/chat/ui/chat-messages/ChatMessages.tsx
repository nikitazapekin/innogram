'use client';

import { useEffect, useRef } from 'react';
import type { Message } from '@/app/entities/chat';
import styles from './ChatMessages.module.scss';

type ChatMessagesProps = {
  messages: Message[];
  currentProfileId: number;
};

export function ChatMessages({ messages = [], currentProfileId }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>Сообщений пока нет</p>
        <p className={styles.emptyHint}>Напишите первое сообщение</p>
      </div>
    );
  }

  return (
    <div className={styles.messages}>
      {messages.map((msg) => {
        const isOwn = msg.authorProfileId === currentProfileId;
        return (
          <div
            key={msg.id}
            className={`${styles.message} ${isOwn ? styles.message_own : styles.message_other}`}
          >
            {!isOwn && (
              <div className={styles.avatar}>
                {msg.authorAvatar ? (
                  <img alt="" className={styles.avatarImg} src={msg.authorAvatar} />
                ) : (
                  <div className={styles.avatarPlaceholder}>{msg.authorName.charAt(0)}</div>
                )}
              </div>
            )}
            <div className={styles.bubble}>
              {!isOwn && <div className={styles.author}>{msg.authorName}</div>}
              {msg.content && <p className={styles.text}>{msg.content}</p>}
              {msg.assets.length > 0 && (
                <div className={styles.assets}>
                  {msg.assets.map((asset) => (
                    <div key={asset.id} className={styles.asset}>
                      {asset.mimeType.startsWith('image/') ? (
                        <img alt={asset.fileName} className={styles.assetImage} src={asset.url} />
                      ) : (
                        <div className={styles.assetFile}>
                          <img alt="" className={styles.assetIcon} src="/folder.png" />
                          <span className={styles.assetName}>{asset.fileName}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.time}>
                {new Date(msg.createdAt).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
