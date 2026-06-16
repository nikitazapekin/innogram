'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  Chat as ChatType,
  ChatParticipant,
  Message as MessageType,
} from '@/app/entities/chat';
import { ChatList } from '@/app/features/chat/ui/chat-list';
import { ChatMessages } from '@/app/features/chat/ui/chat-messages';
import { ChatCompose } from '@/app/features/chat/ui/chat-compose';
import { ChatParticipants } from '@/app/features/chat/ui/chat-participants';
import { CreateChatModal } from '@/app/features/chat/ui/create-chat-modal';
import { uploadChatFile } from '@/app/features/chat/api/uploadChatFile';
import type { BackendChat, BackendMessage } from '@/app/features/chat/lib/backendTypes';
import { mapChat, mapMessage } from '@/app/features/chat/lib/mappers';
import { useChatSocket } from '@/app/features/chat/lib/useChatSocket';
import { fetchCurrentProfile, fetchProfiles, type ProfileDto } from '@/app/shared/api/users';
import styles from './Chat.module.scss';

type CreateModalMode = 'private' | 'group' | null;

function resolveDevProfileId(): number | null {
  const raw = process.env.NEXT_PUBLIC_CHAT_PROFILE_ID;
  if (!raw) return null;
  const id = Number(raw);
  if (Number.isFinite(id)) {
    return id;
  }
  return null;
}

export function Chat() {
  const [view, setView] = useState<'list' | 'chat'>('list');
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [messages, setMessages] = useState<Record<number, MessageType[]>>({});
  const [profileId, setProfileId] = useState<number | null>(resolveDevProfileId());
  const [profiles, setProfiles] = useState<ProfileDto[]>([]);
  const [createModal, setCreateModal] = useState<CreateModalMode>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  const profileNames = useMemo(() => {
    const map = new Map<number, string>();
    for (const profile of profiles) {
      if (profile.id) {
        map.set(profile.id, profile.displayName ?? `Профиль ${profile.id}`);
      }
    }
    return map;
  }, [profiles]);

  const chatSocket = useChatSocket({ profileId, enabled: profileId !== null });

  useEffect(() => {
    let cancelled = false;

    async function loadProfiles() {
      try {
        const [allProfiles, current] = await Promise.all([fetchProfiles(), fetchCurrentProfile()]);

        if (cancelled) return;

        setProfiles(allProfiles);
        setStatusError(null);

        const devProfileId = resolveDevProfileId();
        const resolvedId = current?.id ?? devProfileId;

        if (resolvedId) {
          setProfileId(resolvedId);
        } else {
          setStatusError('Войдите в аккаунт, чтобы использовать чаты');
        }
      } catch (error) {
        if (!cancelled) {
          let message: string;
          if (error instanceof Error) {
            message = error.message;
          } else {
            message = 'Ошибка загрузки профиля';
          }
          setStatusError(message);
        }
      }
    }

    void loadProfiles();

    return () => {
      cancelled = true;
    };
  }, []);

  const upsertChat = useCallback(
    (backendChat: BackendChat, lastMessage?: MessageType) => {
      if (!profileId) return;

      setChats((prev) => {
        const mapped = mapChat(backendChat, profileId, profileNames, lastMessage);
        const index = prev.findIndex((chat) => chat.id === mapped.id);
        if (index === -1) {
          return [mapped, ...prev];
        }
        const next = [...prev];
        let participants: ChatParticipant[];
        if (next[index].participants.length) {
          participants = next[index].participants;
        } else {
          participants = mapped.participants;
        }
        next[index] = { ...next[index], ...mapped, participants };
        return next;
      });
    },
    [profileId, profileNames],
  );

  const mergeMessages = useCallback(
    (chatId: number, incoming: BackendMessage[], replace = false) => {
      const mapped = incoming
        .map((backendMessage) => mapMessage(backendMessage, profileNames))
        .sort(
          (messageA, messageB) =>
            new Date(messageA.createdAt).getTime() - new Date(messageB.createdAt).getTime(),
        );

      setMessages((prev) => {
        let updatedMessages: MessageType[];
        if (replace) {
          updatedMessages = mapped;
        } else {
          const existing = prev[chatId] ?? [];
          const combined = [...existing, ...mapped];
          updatedMessages = combined.filter(
            (message, index, arr) =>
              arr.findIndex((existingMessage) => existingMessage.id === message.id) === index,
          );
        }
        return { ...prev, [chatId]: updatedMessages };
      });

      const latestMessage = mapped[mapped.length - 1];
      if (latestMessage) {
        setChats((prev) =>
          prev.map((chat) => {
            if (chat.id === chatId) {
              return { ...chat, lastMessage: latestMessage };
            }
            return chat;
          }),
        );
      }
    },
    [profileNames],
  );

  useEffect(() => {
    chatSocket.onChats((backendChats) => {
      if (!profileId) return;

      setChats((prev) =>
        backendChats.map((chat) => {
          const existing = prev.find((item) => item.id === chat.id);
          return mapChat(chat, profileId, profileNames, existing?.lastMessage);
        }),
      );
    });

    chatSocket.onMessages((chatId, backendMessages) => {
      mergeMessages(chatId, backendMessages, true);
    });

    chatSocket.onNewMessage((backendMessage) => {
      const mapped = mapMessage(backendMessage, profileNames);
      setMessages((prev) => {
        const list = prev[mapped.chatId] ?? [];
        if (list.some((message) => message.id === mapped.id)) {
          return prev;
        }
        return { ...prev, [mapped.chatId]: [...list, mapped] };
      });
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id === mapped.chatId) {
            return { ...chat, lastMessage: mapped, updatedAt: mapped.createdAt };
          }
          return chat;
        }),
      );
    });

    chatSocket.onMessageEdited((backendMessage) => {
      const mapped = mapMessage(backendMessage, profileNames);
      setMessages((prev) => {
        const updatedList = (prev[mapped.chatId] ?? []).map((message) => {
          if (message.id === mapped.id) {
            return mapped;
          }
          return message;
        });
        return { ...prev, [mapped.chatId]: updatedList };
      });
    });

    chatSocket.onMessageDeleted(({ messageId }) => {
      setMessages((prev) => {
        const next: Record<number, MessageType[]> = {};
        for (const [chatId, list] of Object.entries(prev)) {
          next[Number(chatId)] = list.filter((message) => message.id !== messageId);
        }
        return next;
      });
    });

    chatSocket.onChatCreated((backendChat) => {
      upsertChat(backendChat);
      setActiveChatId(backendChat.id);
      setView('chat');
      chatSocket.emitJoinChat(backendChat.id);
      chatSocket.emitGetMessages(backendChat.id);
    });

    chatSocket.onMemberAdded(({ chatId, profileId: addedProfileId }) => {
      const id = Number(chatId);
      setChats((prev) =>
        prev.map((chat) => {
          if (chat.id !== id) return chat;

          const alreadyMember = chat.participants.some(
            (participant) => participant.profileId === addedProfileId,
          );
          if (alreadyMember) {
            return chat;
          }

          const newParticipant: ChatParticipant = {
            id: addedProfileId,
            profileId: addedProfileId,
            name: profileNames.get(addedProfileId) ?? `Профиль ${addedProfileId}`,
            role: 'member',
          };

          return {
            ...chat,
            type: 'group',
            participants: [...chat.participants, newParticipant],
          };
        }),
      );
    });

    chatSocket.onError((message) => setStatusError(message));
  }, [chatSocket, mergeMessages, profileId, profileNames, upsertChat]);

  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? null;
  let activeMessages: MessageType[];
  if (activeChatId) {
    activeMessages = messages[activeChatId] ?? [];
  } else {
    activeMessages = [];
  }

  const handleSelectChat = (chat: ChatType) => {
    setActiveChatId(chat.id);
    setView('chat');
    chatSocket.emitJoinChat(chat.id);
    chatSocket.emitGetMessages(chat.id);
  };

  const handleBack = () => {
    if (activeChatId) {
      chatSocket.emitLeaveChat(activeChatId);
    }
    setView('list');
  };

  const handleSend = async (content: string, files: File[]) => {
    if (!activeChatId || !profileId) return;

    setStatusError(null);

    try {
      const assetIds: number[] = [];
      for (const file of files) {
        const asset = await uploadChatFile(file, profileId);
        assetIds.push(asset.id);
      }

      let sendAssetIds: number[] | undefined;
      if (assetIds.length > 0) {
        sendAssetIds = assetIds;
      }
      chatSocket.emitSendMessage(activeChatId, content, sendAssetIds);
    } catch (error) {
      let message: string;
      if (error instanceof Error) {
        message = error.message;
      } else {
        message = 'Не удалось отправить сообщение';
      }
      setStatusError(message);
    }
  };

  const handleCreatePrivate = (targetProfileId: number) => {
    chatSocket.emitCreatePrivateChat(targetProfileId);
  };

  const handleCreateGroup = (participantIds: number[]) => {
    chatSocket.emitCreateGroupChat(participantIds);
  };

  const handleAddParticipant = (newProfileId: number) => {
    if (!activeChatId) return;
    chatSocket.emitAddToGroup(activeChatId, newProfileId);
  };

  const sidebarClassNames = [styles.sidebar];
  if (view === 'list') {
    sidebarClassNames.push(styles.sidebar_visible);
  }
  const sidebarClassName = sidebarClassNames.join(' ');

  const mainClassNames = [styles.main];
  if (view === 'chat') {
    mainClassNames.push(styles.main_visible);
  }
  const mainClassName = mainClassNames.join(' ');

  let mainContent: React.ReactNode;
  if (activeChat) {
    mainContent = (
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
        <ChatMessages currentProfileId={profileId ?? 0} messages={activeMessages} />
        <ChatCompose disabled={!chatSocket.connected} onSend={handleSend} />
      </>
    );
  } else {
    mainContent = (
      <div className={styles.noChat}>
        <p className={styles.noChatText}>Выберите чат</p>
        <p className={styles.noChatHint}>Начните общение с выбора чата слева</p>
      </div>
    );
  }

  let addParticipantHandler: typeof handleAddParticipant | undefined;
  if (activeChat?.type === 'group') {
    addParticipantHandler = handleAddParticipant;
  }

  return (
    <div className={styles.chat}>
      {(statusError || chatSocket.socketError) && (
        <p className={styles.error}>{statusError ?? chatSocket.socketError}</p>
      )}
      {createModal && profileId && (
        <CreateChatModal
          currentProfileId={profileId}
          mode={createModal}
          onClose={() => setCreateModal(null)}
          onCreateGroup={handleCreateGroup}
          onCreatePrivate={handleCreatePrivate}
          profiles={profiles}
        />
      )}
      <div className={sidebarClassName}>
        <ChatList
          activeChatId={activeChatId}
          chats={chats}
          connected={chatSocket.connected}
          connecting={profileId !== null && !chatSocket.connected}
          onCreateGroup={() => setCreateModal('group')}
          onCreatePrivate={() => setCreateModal('private')}
          onSelect={handleSelectChat}
        />
      </div>
      <div className={mainClassName}>{mainContent}</div>
      <div className={styles.sidebarRight}>
        {activeChat && profileId && (
          <ChatParticipants
            currentProfileId={profileId}
            isGroup={activeChat.type === 'group'}
            onAddParticipant={addParticipantHandler}
            participants={activeChat.participants}
            profiles={profiles}
          />
        )}
      </div>
    </div>
  );
}
