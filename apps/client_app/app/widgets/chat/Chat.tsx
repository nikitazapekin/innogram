'use client';

import { useState } from 'react';
import type { Chat as ChatType, Message as MessageType } from '@/app/entities/chat';
import { ChatList } from '@/app/features/chat/ui/chat-list';
import { ChatMessages } from '@/app/features/chat/ui/chat-messages';
import { ChatCompose } from '@/app/features/chat/ui/chat-compose';
import { ChatParticipants } from '@/app/features/chat/ui/chat-participants';
import styles from './Chat.module.scss';

const currentProfileId = 1;

export function Chat() {
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [messages, setMessages] = useState<Record<number, MessageType[]>>({});

  const activeChat = chats.find((c) => c.id === activeChatId) ?? null;
  const activeMessages = activeChatId ? (messages[activeChatId] ?? []) : [];

  const handleSelectChat = (chat: ChatType) => {
    setActiveChatId(chat.id);
    setView('chat');
  };

  const handleBack = () => {
    setView('list');
  };

  const handleSend = (content: string, files: File[]) => {
    if (!activeChatId) return;
    const newMessage: MessageType = {
      id: Date.now(),
      chatId: activeChatId,
      authorProfileId: currentProfileId,
      authorName: 'Вы',
      content: content || null,
      assets: files.map((f, i) => ({
        id: Date.now() + i,
        fileName: f.name,
        mimeType: f.type,
        url: URL.createObjectURL(f),
      })),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] ?? []), newMessage],
    }));
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, lastMessage: newMessage, updatedAt: newMessage.createdAt }
          : chat,
      ),
    );
  };

  return (
    <div className={styles.chat}>
      <div className={`${styles.sidebar} ${view === 'list' ? styles.sidebar_visible : ''}`}>
        <ChatList activeChatId={activeChatId} chats={chats} onSelect={handleSelectChat} />
      </div>
      <div className={`${styles.main} ${view === 'chat' ? styles.main_visible : ''}`}>
        {activeChat ? (
          <>
            <div className={styles.mainHeader}>
              <button className={styles.backButton} onClick={handleBack} type="button">
                ←
              </button>
              <div className={styles.mainHeaderInfo}>
                <span className={styles.mainHeaderName}>{activeChat.name ?? 'Чат'}</span>
                {activeChat.type === 'group' && (
                  <span className={styles.mainHeaderType}>Групповой чат</span>
                )}
              </div>
            </div>
            <ChatMessages currentProfileId={currentProfileId} messages={activeMessages} />
            <ChatCompose onSend={handleSend} />
          </>
        ) : (
          <div className={styles.noChat}>
            <p className={styles.noChatText}>Выберите чат</p>
            <p className={styles.noChatHint}>Начните общение с выбора чата слева</p>
          </div>
        )}
      </div>
      <div className={styles.sidebarRight}>
        {activeChat ? (
          <ChatParticipants
            currentProfileId={currentProfileId}
            participants={activeChat.participants}
          />
        ) : null}
      </div>
    </div>
  );
}
