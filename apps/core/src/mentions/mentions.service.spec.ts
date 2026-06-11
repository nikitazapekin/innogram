import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Profile } from '../entities/profile.entity';
import { MentionsService } from './mentions.service';

function mockProfile(displayName: string, id: number = 1): Profile {
  const profile = new Profile();

  profile.id = id;
  profile.displayName = displayName;

  return profile;
}

describe('MentionsService', () => {
  let service: MentionsService;
  let profilesRepository: jest.Mocked<Pick<Repository<Profile>, 'createQueryBuilder'>>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    mockQueryBuilder.where.mockClear();
    mockQueryBuilder.getMany.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MentionsService,
        {
          provide: getRepositoryToken(Profile),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
      ],
    }).compile();

    service = module.get<MentionsService>(MentionsService);
    profilesRepository = module.get(getRepositoryToken(Profile));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('extractMentions', () => {
    it('should return empty array when text has no mentions', async () => {
      const result = await service.extractMentions('Hello world');

      expect(result).toEqual([]);
      expect(profilesRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should return empty array when text has only special characters', async () => {
      const result = await service.extractMentions('@ @@@ @!');

      expect(result).toEqual([]);
      expect(profilesRepository.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('should extract single mention and return matching profile', async () => {
      const alice = mockProfile('Alice');

      mockQueryBuilder.getMany.mockResolvedValueOnce([alice]);

      const result = await service.extractMentions('Hello @Alice');

      expect(result).toEqual([{ mentionedProfileId: 1, displayName: 'Alice' }]);
      expect(profilesRepository.createQueryBuilder).toHaveBeenCalledWith('profile');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'LOWER(profile.displayName) IN (:...names)',
        { names: ['alice'] },
      );
    });

    it('should extract multiple mentions and return matching profiles', async () => {
      const alice = mockProfile('Alice');
      const bob = mockProfile('Bob', 2);

      mockQueryBuilder.getMany.mockResolvedValueOnce([alice, bob]);

      const result = await service.extractMentions('Hello @Alice and @Bob');

      expect(result).toHaveLength(2);
      expect(result).toContainEqual({ mentionedProfileId: 1, displayName: 'Alice' });
      expect(result).toContainEqual({ mentionedProfileId: 2, displayName: 'Bob' });
    });

    it('should deduplicate same mention used multiple times', async () => {
      const alice = mockProfile('Alice');

      mockQueryBuilder.getMany.mockResolvedValueOnce([alice]);

      const result = await service.extractMentions('@Alice hello @Alice');

      expect(result).toHaveLength(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(expect.any(String), { names: ['alice'] });
    });

    it('should match case-insensitively', async () => {
      const alice = mockProfile('Alice');

      mockQueryBuilder.getMany.mockResolvedValueOnce([alice]);

      const result = await service.extractMentions('@alice');

      expect(result).toEqual([{ mentionedProfileId: 1, displayName: 'Alice' }]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(expect.any(String), { names: ['alice'] });
    });

    it('should skip mentions that do not match any profile', async () => {
      mockQueryBuilder.getMany.mockResolvedValueOnce([]);

      const result = await service.extractMentions('Hello @UnknownPerson');

      expect(result).toEqual([]);
    });

    it('should not send names exceeding 120 characters to the database', async () => {
      const longName = 'a'.repeat(121);

      mockQueryBuilder.getMany.mockResolvedValueOnce([]);

      const result = await service.extractMentions(`Hello @${longName}`);

      expect(result).toEqual([]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(expect.any(String), {
        names: [longName.slice(0, 120)],
      });
    });

    it('should pass all matched mentions to the query builder', async () => {
      const alice = mockProfile('Alice');

      mockQueryBuilder.getMany.mockResolvedValueOnce([alice]);

      const result = await service.extractMentions('@Alice @ @Unknown @123');

      expect(result).toEqual([{ mentionedProfileId: 1, displayName: 'Alice' }]);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(expect.any(String), {
        names: ['alice', 'unknown', '123'],
      });
    });
  });
});
