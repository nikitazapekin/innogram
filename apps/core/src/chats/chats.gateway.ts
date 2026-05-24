import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Public } from '@innogram/shared';
import { Server, Socket } from 'socket.io';

import { ChatsService } from './chats.service';

@Public()
@WebSocketGateway({
  namespace: '/chats',
  cors: { origin: '*' },
})
export class ChatsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatsGateway.name);
  private readonly profileSockets = new Map<number, Set<string>>();

  constructor(private readonly chatsService: ChatsService) {}

  afterInit(): void {
    this.logger.log('Socket.IO gateway initialized at ws://localhost:3001/chats');
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    for (const [profileId, sockets] of this.profileSockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) this.profileSockets.delete(profileId);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('create_private_chat')
  async handlePrivateChat(
    client: Socket,
    payload: { myProfileId: number; targetProfileId: number },
  ): Promise<void> {
    try {
      const chat = await this.chatsService.createPrivateChat(
        payload.myProfileId,
        payload.targetProfileId,
      );
      client.join(chat.id);
      client.emit('chat_created', chat);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      client.emit('error', { message });
    }
  }

  @SubscribeMessage('register')
  handleRegister(client: Socket, payload: { profileId: number }): void {
    if (!this.profileSockets.has(payload.profileId)) {
      this.profileSockets.set(payload.profileId, new Set());
    }
    this.profileSockets.get(payload.profileId)!.add(client.id);
    this.logger.log(`Profile ${payload.profileId} registered on socket ${client.id}`);
  }

  @SubscribeMessage('create_group_chat')
  async handleGroupChat(
    client: Socket,
    payload: { creatorProfileId: number; participantIds: number[] },
  ): Promise<void> {
    try {
      const allIds = [
        payload.creatorProfileId,
        ...payload.participantIds.filter((id) => id !== payload.creatorProfileId),
      ];
      const chat = await this.chatsService.createGroupChat(allIds);
      client.join(chat.id);

      for (const pid of allIds) {
        const sockets = this.profileSockets.get(pid);
        if (sockets) {
          for (const sid of sockets) {
            const memberSocket = this.server?.sockets?.sockets?.get(sid);
            if (memberSocket && memberSocket.id !== client.id) {
              memberSocket.join(chat.id);
              memberSocket.emit('chat_created', chat);
            }
          }
        }
      }

      client.emit('chat_created', chat);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      client.emit('error', { message });
    }
  }

  @SubscribeMessage('join_chat')
  async handleJoinChat(
    client: Socket,
    payload: { chatId: string; profileId: number },
  ): Promise<void> {
    try {
      await this.chatsService.addParticipant(payload.chatId, payload.profileId);
      client.join(payload.chatId);
      client.emit('chat_joined', { chatId: payload.chatId });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      client.emit('error', { message });
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    client: Socket,
    payload: { chatId: string; authorProfileId: number; content: string },
  ): Promise<void> {
    try {
      const message = await this.chatsService.sendMessage(
        payload.chatId,
        payload.authorProfileId,
        payload.content,
      );
      client.to(payload.chatId).emit('new_message', message);
      client.emit('new_message', message);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      client.emit('error', { message });
    }
  }

  @SubscribeMessage('get_chats')
  async handleGetChats(client: Socket, payload: { profileId: number }): Promise<void> {
    try {
      const chats = await this.chatsService.getChats(payload.profileId);
      client.emit('chats', chats);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      client.emit('error', { message });
    }
  }

  @SubscribeMessage('get_messages')
  async handleGetMessages(
    client: Socket,
    payload: { chatId: string; offset?: number; limit?: number },
  ): Promise<void> {
    try {
      const messages = await this.chatsService.getMessages(
        payload.chatId,
        payload.offset,
        payload.limit,
      );
      client.emit('messages', messages);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      client.emit('error', { message });
    }
  }

  @SubscribeMessage('leave_chat')
  async handleLeaveChat(client: Socket, payload: { chatId: string }): Promise<void> {
    client.leave(payload.chatId);
    client.emit('chat_left', { chatId: payload.chatId });
  }
}
