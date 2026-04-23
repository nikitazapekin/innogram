import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Profile } from '../entities/profile.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

const DEFAULT_DISPLAY_NAME = 'User';
const DEFAULT_BIO = 'No bio';
const DEFAULT_AVATAR_ASSET_ID = null;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
  ) {}

  async create(userDto: UpdateUserDto): Promise<UserDto> {
    const profile = this.profilesRepository.create({
      displayName: userDto.displayName || DEFAULT_DISPLAY_NAME,
      bio: userDto.bio || DEFAULT_BIO,
      avatarAssetId: userDto.avatarAssetId || DEFAULT_AVATAR_ASSET_ID,
    });
    const CREATED_MESSAGE = 'Profile created';
    const savedProfile = await this.profilesRepository.save(profile);

    this.logger.log(`${CREATED_MESSAGE}: ${savedProfile.id}`);
    const savedProfileResponse = this.toUserDto(savedProfile);
    return savedProfileResponse;
  }

  async findAll(): Promise<UserDto[]> {
    const profilesFindOptions = {
      order: { createdAt: 'DESC' },
    } as const;

    const profiles = await this.profilesRepository.find(profilesFindOptions);
    const profilesResponse = profiles.map((profile) => this.toUserDto(profile));
    return profilesResponse;
  }

  async findOne(id: number): Promise<UserDto> {
    const profile = await this.findProfileById(id);
    const profilesResponse = this.toUserDto(profile);
    return profilesResponse;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const profile = await this.findProfileById(id);
    const UPDATED_MESSAGE = 'Profile updated';
    this.updateProfileFieldsPartial(profile, updateUserDto);
    const savedProfile = await this.profilesRepository.save(profile);

    this.logger.log(`${UPDATED_MESSAGE}: ${savedProfile.id}`);
    const savedProfileResponse = this.toUserDto(savedProfile);
    return savedProfileResponse;
  }

  async remove(id: number): Promise<void> {
    const DELETED_MESSAGE = 'Profile deleted';
    await this.findProfileById(id);
    await this.profilesRepository.delete(id);
    this.logger.log(`${DELETED_MESSAGE}: ${id}`);
  }

  async put(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const profile = await this.findProfileById(id);
    const UPDATED_MESSAGE = 'Profile fully updated';
    this.updateProfileFieldsFull(profile, updateUserDto);
    const savedProfile = await this.profilesRepository.save(profile);

    this.logger.log(`${UPDATED_MESSAGE}: ${savedProfile.id}`);
    const savedProfileResponse = this.toUserDto(savedProfile);
    return savedProfileResponse;
  }

  private async findProfileById(id: number): Promise<Profile> {
    const profileNotFoundMessage = 'Profile was not found.';
    const profile = await this.profilesRepository.findOneBy({ id });

    if (!profile) {
      throw new NotFoundException(profileNotFoundMessage);
    }

    return profile;
  }

  private updateProfileFieldsPartial(profile: Profile, updateUserDto: UpdateUserDto): void {
    const { displayName, bio, avatarAssetId } = updateUserDto;

    if (!displayName && !bio && !avatarAssetId) {
      return;
    }

    profile.displayName = displayName || profile.displayName;
    profile.bio = bio || profile.bio;
    profile.avatarAssetId = avatarAssetId || profile.avatarAssetId;
  }

  private updateProfileFieldsFull(profile: Profile, updateUserDto: UpdateUserDto): void {
    profile.displayName = updateUserDto.displayName || DEFAULT_DISPLAY_NAME;
    profile.bio = updateUserDto.bio || DEFAULT_BIO;
    profile.avatarAssetId = updateUserDto.avatarAssetId || DEFAULT_AVATAR_ASSET_ID;
  }

  private toUserDto(profile: Profile): UserDto {
    return {
      id: profile.id,
      displayName: profile.displayName || DEFAULT_DISPLAY_NAME,
      bio: profile.bio || DEFAULT_BIO,
      avatarAssetId: profile.avatarAssetId || DEFAULT_AVATAR_ASSET_ID,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
