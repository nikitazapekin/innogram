import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';
import { ChatsGateway } from './chats.gateway';
import { ChatsService } from './chats.service';

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message])],
  providers: [ChatsGateway, ChatsService],
})
export class ChatsModule {}
