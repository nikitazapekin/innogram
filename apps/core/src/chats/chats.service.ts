import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { In, Repository } from 'typeorm';

import { Asset } from '../entities/asset.entity';
import { Chat } from '../entities/chat.entity';
import { Message } from '../entities/message.entity';

const UPLOADS_DIR = path.resolve('uploads');

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
  ) {}

  async createPrivateChat(profileId1: number, profileId2: number): Promise<Chat> {
    const existing = await this.chatRepository
      .createQueryBuilder('chat')
      .select('chat.id')
      .innerJoin('chat.participants', 'p')
      .where('p.id IN (:...ids)', { ids: [profileId1, profileId2] })
      .groupBy('chat.id')
      .having('COUNT(p.id) = 2')
      .getRawOne<{ chat_id: number }>();

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

  async getMessages(chatId: number, offset = 0, limit = 50): Promise<Message[]> {
    return this.messageRepository.find({
      where: { chatId },
      order: { createdAt: 'DESC' },
      skip: offset,
      take: limit,
      relations: ['assets'],
    });
  }

  async sendMessage(
    chatId: number,
    authorProfileId: number,
    content: string,
    assetIds?: number[],
  ): Promise<Message> {
    const chat = await this.chatRepository.findOneBy({ id: chatId });
    if (!chat) throw new NotFoundException('Chat not found');

    const message = new Message();
    message.chatId = chatId;
    message.authorProfileId = authorProfileId;
    (message as { content: string | null }).content = content || null;

    const saved = await this.messageRepository.save(message);

    if (assetIds && assetIds.length > 0) {
      const assets = await this.assetRepository.findBy({ id: In(assetIds) });
      saved.assets = assets;
      await this.messageRepository.save(saved);
    }

    const result = await this.messageRepository.findOne({
      where: { id: saved.id },
      relations: ['assets'],
    });
    return result!;
  }

  async editMessage(messageId: number, profileId: number, content: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['assets'],
    });
    if (!message) throw new NotFoundException('Message not found');
    if (message.authorProfileId !== profileId) throw new ForbiddenException('Not your message');

    message.content = content;
    return this.messageRepository.save(message);
  }

  async deleteMessage(messageId: number, profileId: number): Promise<{ chatId: number }> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['assets'],
    });
    if (!message) throw new NotFoundException('Message not found');
    if (message.authorProfileId !== profileId) throw new ForbiddenException('Not your message');

    const chatId = message.chatId;
    await this.messageRepository.remove(message);
    return { chatId };
  }

  async saveFile(
    file: Express.Multer.File,
    ownerProfileId: number,
  ): Promise<Asset & { url: string }> {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, safeName);
    fs.writeFileSync(filePath, file.buffer);

    const asset = this.assetRepository.create({
      ownerProfileId,
      fileName: safeName,
      mimeType: file.mimetype,
    });

    const saved = await this.assetRepository.save(asset);
    return { ...saved, url: `/uploads/${safeName}` };
  }

  async attachFileToMessage(messageId: number, assetId: number): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['assets'],
    });
    if (!message) throw new NotFoundException('Message not found');

    const asset = await this.assetRepository.findOneBy({ id: assetId });
    if (!asset) throw new NotFoundException('Asset not found');

    message.assets = [...(message.assets || []), asset];
    return this.messageRepository.save(message);
  }

  async addParticipant(chatId: number, profileId: number): Promise<void> {
    const chat = await this.chatRepository.findOneBy({ id: chatId });
    if (!chat) throw new NotFoundException('Chat not found');

    try {
      await this.chatRepository
        .createQueryBuilder()
        .relation(Chat, 'participants')
        .of(chatId)
        .add(profileId);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error) return;
      throw new NotFoundException('Profile not found');
    }
  }

  async getChat(chatId: number): Promise<Chat> {
    const chat = await this.chatRepository.findOneByOrFail({ id: chatId });
    return chat;
  }

  async isParticipant(chatId: number, profileId: number): Promise<boolean> {
    const count = await this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin('chat.participants', 'p')
      .where('chat.id = :chatId', { chatId })
      .andWhere('p.id = :profileId', { profileId })
      .getCount();

    return count > 0;
  }
}
