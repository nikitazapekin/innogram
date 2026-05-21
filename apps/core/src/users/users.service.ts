import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Profile } from '../entities/profile.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
  ) {}

  async create(userDto: UpdateUserDto): Promise<UserDto> {
    const profile = this.profilesRepository.create({
      displayName: userDto.displayName,
      bio: userDto.bio,
      avatarAssetId: userDto.avatarAssetId,
    });

    const savedProfile = await this.profilesRepository.save(profile);

    this.logger.log(`Profile created: ${savedProfile.id}`);
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

  async findFollowingProfiles(id: number): Promise<UserDto[]> {
    await this.findProfileById(id);

    const followingProfiles = await this.profilesRepository
      .createQueryBuilder('profile')
      .relation(Profile, 'followingProfiles')
      .of(id)
      .loadMany<Profile>();

    return followingProfiles.map((profile) => this.toUserDto(profile));
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const profile = await this.findProfileById(id);

    this.updateProfileFieldsPartial(profile, updateUserDto);
    const savedProfile = await this.profilesRepository.save(profile);

    this.logger.log(`Profile updated: ${savedProfile.id}`);
    const savedProfileResponse = this.toUserDto(savedProfile);

    return savedProfileResponse;
  }

  async remove(id: number): Promise<void> {
    await this.findProfileById(id);
    await this.profilesRepository.delete(id);
    this.logger.log(`Profile deleted: ${id}`);
  }

  async put(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const profile = await this.findProfileById(id);

    this.updateProfileFieldsFull(profile, updateUserDto);
    const savedProfile = await this.profilesRepository.save(profile);

    this.logger.log(`Profile fully updated: ${savedProfile.id}`);
    const savedProfileResponse = this.toUserDto(savedProfile);

    return savedProfileResponse;
  }

  async followProfile(followerId: number, followingId: number): Promise<void> {
    this.ensureDifferentProfileIds(followerId, followingId);

    await this.profilesRepository
      .createQueryBuilder()
      .relation(Profile, 'followingProfiles')
      .of(followerId)
      .add(followingId);

    this.logger.log(`Profile ${followerId} followed profile ${followingId}`);
  }

  async unfollowProfile(followerId: number, followingId: number): Promise<void> {
    this.ensureDifferentProfileIds(followerId, followingId);

    await this.profilesRepository
      .createQueryBuilder()
      .relation(Profile, 'followingProfiles')
      .of(followerId)
      .remove(followingId);

    this.logger.log(`Profile ${followerId} unfollowed profile ${followingId}`);
  }

  private async findProfileById(id: number): Promise<Profile> {
    const profile = await this.profilesRepository.findOneBy({ id });

    if (!profile) {
      throw new NotFoundException('Profile was not found.');
    }

    return profile;
  }

  private ensureDifferentProfileIds(followerId: number, followingId: number): void {
    if (followerId === followingId) {
      throw new BadRequestException('Profile cannot follow itself.');
    }
  }

  private updateProfileFieldsPartial(profile: Profile, updateUserDto: UpdateUserDto): void {
    const { displayName, bio, avatarAssetId } = updateUserDto;

    if (!displayName && !bio && !avatarAssetId) {
      return;
    }

    profile.displayName = displayName ?? profile.displayName;
    profile.bio = bio ?? profile.bio;
    profile.avatarAssetId = avatarAssetId ?? profile.avatarAssetId;
  }

  private updateProfileFieldsFull(profile: Profile, updateUserDto: UpdateUserDto): void {
    profile.displayName = updateUserDto.displayName;
    profile.bio = updateUserDto.bio ?? null;
    profile.avatarAssetId = updateUserDto.avatarAssetId ?? null;
  }

  private toUserDto(profile: Profile): UserDto {
    return {
      id: profile.id,
      displayName: profile.displayName,
      bio: profile.bio ?? undefined,
      avatarAssetId: profile.avatarAssetId,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }
}
