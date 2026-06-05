'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';

import { CORE_API_URL } from '@/app/shared/config/api';

import type { BackendChat, BackendMessage } from './backendTypes';

type UseChatSocketOptions = {
  profileId: number | null;
  enabled?: boolean;
};

type UseChatSocketResult = {
  connected: boolean;
  socketError: string | null;
  emitRegister: () => void;
  emitGetChats: () => void;
  emitGetMessages: (chatId: number) => void;
  emitJoinChat: (chatId: number) => void;
  emitLeaveChat: (chatId: number) => void;
  emitSendMessage: (chatId: number, content: string, assetIds?: number[]) => void;
  emitCreatePrivateChat: (targetProfileId: number) => void;
  emitCreateGroupChat: (participantIds: number[]) => void;
  emitAddToGroup: (chatId: number, newProfileId: number) => void;
  onChats: (handler: (chats: BackendChat[]) => void) => void;
  onMessages: (handler: (chatId: number, messages: BackendMessage[]) => void) => void;
  onNewMessage: (handler: (message: BackendMessage) => void) => void;
  onMessageEdited: (handler: (message: BackendMessage) => void) => void;
  onMessageDeleted: (handler: (payload: { messageId: number }) => void) => void;
  onChatCreated: (handler: (chat: BackendChat) => void) => void;
  onMemberAdded: (handler: (payload: { chatId: string; profileId: number }) => void) => void;
  onError: (handler: (message: string) => void) => void;
};

export function useChatSocket({
  profileId,
  enabled = true,
}: UseChatSocketOptions): UseChatSocketResult {
  const socketRef = useRef<Socket | null>(null);
  const pendingMessagesChatIdRef = useRef<number | null>(null);
  const [connected, setConnected] = useState(false);
  const [socketError, setSocketError] = useState<string | null>(null);

  const chatsHandlerRef = useRef<(chats: BackendChat[]) => void>(() => {});
  const messagesHandlerRef = useRef<(chatId: number, messages: BackendMessage[]) => void>(() => {});
  const newMessageHandlerRef = useRef<(message: BackendMessage) => void>(() => {});
  const messageEditedHandlerRef = useRef<(message: BackendMessage) => void>(() => {});
  const messageDeletedHandlerRef = useRef<(payload: { messageId: number }) => void>(() => {});
  const chatCreatedHandlerRef = useRef<(chat: BackendChat) => void>(() => {});
  const memberAddedHandlerRef = useRef<(payload: { chatId: string; profileId: number }) => void>(
    () => {},
  );
  const errorHandlerRef = useRef<(message: string) => void>(() => {});

  useEffect(() => {
    if (!enabled || !profileId) {
      return;
    }

    const socket = io(`${CORE_API_URL}/chats`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    socketRef.current = socket;

    const handleConnect = () => {
      setConnected(true);
      setSocketError(null);
      socket.emit('register', { profileId });
      socket.emit('get_chats', { profileId });
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('chats', (chats: BackendChat[]) => chatsHandlerRef.current(chats));
    socket.on('messages', (messages: BackendMessage[]) => {
      const chatId = messages[0]?.chatId ?? pendingMessagesChatIdRef.current;
      if (chatId) {
        messagesHandlerRef.current(chatId, messages);
      }
    });
    socket.on('new_message', (message: BackendMessage) => newMessageHandlerRef.current(message));
    socket.on('message_edited', (message: BackendMessage) =>
      messageEditedHandlerRef.current(message),
    );
    socket.on('message_deleted', (payload: { messageId: number }) =>
      messageDeletedHandlerRef.current(payload),
    );
    socket.on('chat_created', (chat: BackendChat) => chatCreatedHandlerRef.current(chat));
    socket.on('member_added', (payload: { chatId: string; profileId: number }) =>
      memberAddedHandlerRef.current(payload),
    );
    socket.on('error', (payload: { message?: string }) => {
      const message = payload?.message ?? 'Ошибка чата';
      setSocketError(message);
      errorHandlerRef.current(message);
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [enabled, profileId]);

  const emit = useCallback((event: string, payload: unknown) => {
    socketRef.current?.emit(event, payload);
  }, []);

  const emitRegister = useCallback(() => {
    if (!profileId) return;
    emit('register', { profileId });
  }, [emit, profileId]);

  const emitGetChats = useCallback(() => {
    if (!profileId) return;
    emit('get_chats', { profileId });
  }, [emit, profileId]);

  const emitGetMessages = useCallback(
    (chatId: number) => {
      pendingMessagesChatIdRef.current = chatId;
      emit('get_messages', { chatId: String(chatId), offset: 0, limit: 100 });
    },
    [emit],
  );

  const emitJoinChat = useCallback(
    (chatId: number) => {
      if (!profileId) return;
      emit('join_chat', { chatId: String(chatId), profileId });
    },
    [emit, profileId],
  );

  const emitLeaveChat = useCallback(
    (chatId: number) => {
      emit('leave_chat', { chatId: String(chatId) });
    },
    [emit],
  );

  const emitSendMessage = useCallback(
    (chatId: number, content: string, assetIds?: number[]) => {
      if (!profileId) return;
      emit('send_message', {
        chatId: String(chatId),
        authorProfileId: profileId,
        content,
        assetIds,
      });
    },
    [emit, profileId],
  );

  const emitCreatePrivateChat = useCallback(
    (targetProfileId: number) => {
      if (!profileId) return;
      emit('create_private_chat', { myProfileId: profileId, targetProfileId });
    },
    [emit, profileId],
  );

  const emitCreateGroupChat = useCallback(
    (participantIds: number[]) => {
      if (!profileId) return;
      emit('create_group_chat', { creatorProfileId: profileId, participantIds });
    },
    [emit, profileId],
  );

  const emitAddToGroup = useCallback(
    (chatId: number, newProfileId: number) => {
      if (!profileId) return;
      emit('add_to_group', {
        chatId: String(chatId),
        requesterProfileId: profileId,
        newProfileId,
      });
    },
    [emit, profileId],
  );

  return {
    connected,
    socketError,
    emitRegister,
    emitGetChats,
    emitGetMessages,
    emitJoinChat,
    emitLeaveChat,
    emitSendMessage,
    emitCreatePrivateChat,
    emitCreateGroupChat,
    emitAddToGroup,
    onChats: (handler) => {
      chatsHandlerRef.current = handler;
    },
    onMessages: (handler) => {
      messagesHandlerRef.current = handler;
    },
    onNewMessage: (handler) => {
      newMessageHandlerRef.current = handler;
    },
    onMessageEdited: (handler) => {
      messageEditedHandlerRef.current = handler;
    },
    onMessageDeleted: (handler) => {
      messageDeletedHandlerRef.current = handler;
    },
    onChatCreated: (handler) => {
      chatCreatedHandlerRef.current = handler;
    },
    onMemberAdded: (handler) => {
      memberAddedHandlerRef.current = handler;
    },
    onError: (handler) => {
      errorHandlerRef.current = handler;
    },
  };
}
