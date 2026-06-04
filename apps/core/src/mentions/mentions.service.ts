import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Profile } from '../entities/profile.entity';

const MENTION_REGEX = /@(\w{1,120})/g;

export type MentionResult = {
  mentionedProfileId: number;
  displayName: string;
};

@Injectable()
export class MentionsService {
  private readonly logger = new Logger(MentionsService.name);

  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
  ) {}

  async extractMentions(text: string): Promise<MentionResult[]> {
    const matches = [...text.matchAll(MENTION_REGEX)];

    if (matches.length === 0) return [];

    const names = [...new Set(matches.map((m) => m[1].toLowerCase()))];

    const profiles = await this.profilesRepository
      .createQueryBuilder('profile')
      .where('LOWER(profile.displayName) IN (:...names)', { names })
      .getMany();

    return profiles.map((p) => ({
      mentionedProfileId: p.id,
      displayName: p.displayName,
    }));
  }
}
