import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Profile } from '../entities/profile.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

const DEFAULT_DISPLAY_NAME = '';
const DEFAULT_BIO = null;
const DEFAULT_AVATAR_ASSET_ID = null;
const USER_ERROR_MESSAGES = {
  PROFILE_NOT_FOUND: 'User profile was not found.',
} as const;
const USER_LOG_MESSAGES = {
  CREATED: 'User profile created',
  UPDATED: 'User profile updated',
  FULLY_UPDATED: 'User profile fully updated',
  DELETED: 'User profile deleted',
} as const;
const PROFILES_FIND_OPTIONS = {
  order: { createdAt: 'DESC' },
} as const;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
  ) {}

  async create(userDto: UserDto): Promise<UserDto> {
    const profile = this.profilesRepository.create({
      displayName: userDto.displayName ?? DEFAULT_DISPLAY_NAME,
      bio: userDto.bio ?? DEFAULT_BIO,
      avatarAssetId: userDto.avatarAssetId ?? DEFAULT_AVATAR_ASSET_ID,
    });
    const savedProfile = await this.profilesRepository.save(profile);

    this.logger.log(`${USER_LOG_MESSAGES.CREATED}: ${savedProfile.id}`);

    return this.toUserDto(savedProfile);
  }

  async findAll(): Promise<UserDto[]> {
    const profiles = await this.profilesRepository.find(PROFILES_FIND_OPTIONS);

    return profiles.map((profile) => this.toUserDto(profile));
  }

  async findOne(id: string): Promise<UserDto> {
    const profile = await this.findProfileById(id);

    return this.toUserDto(profile);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const profile = await this.findProfileById(id);

    this.updateProfileFieldsPartial(profile, updateUserDto);
    const savedProfile = await this.profilesRepository.save(profile);

    this.logger.log(`${USER_LOG_MESSAGES.UPDATED}: ${savedProfile.id}`);

    return this.toUserDto(savedProfile);
  }

  async remove(id: string): Promise<void> {
    await this.findProfileById(id);
    await this.profilesRepository.delete(id);
    this.logger.log(`${USER_LOG_MESSAGES.DELETED}: ${id}`);
  }

  async put(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const profile = await this.findProfileById(id);

    this.updateProfileFieldsFull(profile, updateUserDto);
    const savedProfile = await this.profilesRepository.save(profile);

    this.logger.log(`${USER_LOG_MESSAGES.FULLY_UPDATED}: ${savedProfile.id}`);

    return this.toUserDto(savedProfile);
  }

  private async findProfileById(id: string): Promise<Profile> {
    const profile = await this.profilesRepository.findOneBy({ id });

    if (!profile) {
      throw new NotFoundException(USER_ERROR_MESSAGES.PROFILE_NOT_FOUND);
    }

    return profile;
  }

  private updateProfileFieldsPartial(profile: Profile, updateUserDto: UpdateUserDto): void {
    if (updateUserDto.displayName !== undefined) {
      profile.displayName = updateUserDto.displayName;
    }

    if (updateUserDto.bio !== undefined) {
      profile.bio = updateUserDto.bio;
    }

    if (updateUserDto.avatarAssetId !== undefined) {
      profile.avatarAssetId = updateUserDto.avatarAssetId;
    }
  }

  private updateProfileFieldsFull(profile: Profile, updateUserDto: UpdateUserDto): void {
    profile.displayName = updateUserDto.displayName ?? DEFAULT_DISPLAY_NAME;
    profile.bio = updateUserDto.bio ?? DEFAULT_BIO;
    profile.avatarAssetId = updateUserDto.avatarAssetId ?? DEFAULT_AVATAR_ASSET_ID;
  }

  private toUserDto(profile: Profile): UserDto {
    return {
      id: profile.id,
      displayName: profile.displayName ?? DEFAULT_DISPLAY_NAME,
      bio: profile.bio ?? DEFAULT_BIO,
      avatarAssetId: profile.avatarAssetId ?? DEFAULT_AVATAR_ASSET_ID,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
