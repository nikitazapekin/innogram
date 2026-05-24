import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async createPrivateChat(profileId1: number, profileId2: number): Promise<Chat> {
    const existing = await this.chatRepository
      .createQueryBuilder('chat')
      .select('chat.id')
      .innerJoin('chat.participants', 'p')
      .where('p.id IN (:...ids)', { ids: [profileId1, profileId2] })
      .groupBy('chat.id')
      .having('COUNT(p.id) = 2')
      .getRawOne<{ chat_id: string }>();

    if (existing) {
      return this.chatRepository.findOneByOrFail({ id: existing.chat_id });
    }

    const chat = this.chatRepository.create();
    await this.chatRepository.save(chat);

    try {
      await this.chatRepository
        .createQueryBuilder()
        .relation(Chat, 'participants')
        .of(chat.id)
        .add([profileId1, profileId2]);
    } catch {
      await this.chatRepository.delete(chat.id);
      throw new NotFoundException('One or both profiles not found');
    }

    return this.chatRepository.findOneByOrFail({ id: chat.id });
  }

  async createGroupChat(participantIds: number[]): Promise<Chat> {
    const chat = this.chatRepository.create();
    await this.chatRepository.save(chat);

    try {
      await this.chatRepository
        .createQueryBuilder()
        .relation(Chat, 'participants')
        .of(chat.id)
        .add(participantIds);
    } catch {
      await this.chatRepository.delete(chat.id);
      throw new NotFoundException('One or more profiles not found');
    }

    return this.chatRepository.findOneByOrFail({ id: chat.id });
  }

  async getChats(profileId: number): Promise<Chat[]> {
    return this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin('chat.participants', 'p')
      .where('p.id = :profileId', { profileId })
      .loadRelationCountAndMap('chat.participantCount', 'chat.participants')
      .orderBy('chat.updatedAt', 'DESC')
      .getMany();
  }

  async getMessages(chatId: string, offset = 0, limit = 50): Promise<Message[]> {
    return this.messageRepository.find({
      where: { chatId },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
    });
  }

  async sendMessage(chatId: string, authorProfileId: number, content: string): Promise<Message> {
    const chat = await this.chatRepository.findOneBy({ id: chatId });
    if (!chat) throw new NotFoundException('Chat not found');

    const message = this.messageRepository.create({
      chatId,
      authorProfileId: String(authorProfileId),
      content,
    }) as Message;

    return this.messageRepository.save(message);
  }

  async addParticipant(chatId: string, profileId: number): Promise<void> {
    const chat = await this.chatRepository.findOneBy({ id: chatId });
    if (!chat) throw new NotFoundException('Chat not found');

    try {
      await this.chatRepository
        .createQueryBuilder()
        .relation(Chat, 'participants')
        .of(chatId)
        .add(profileId);
    } catch (error: any) {
      if (error?.code === '23505') return;
      throw new NotFoundException('Profile not found');
    }
  }
}
