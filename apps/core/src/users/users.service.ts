import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Profile } from '../entities/profile.entity';
import { NotificationEventsProducer } from '../kafka/notification-events.producer';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
    private readonly notificationEventsProducer: NotificationEventsProducer,
  ) {}

  async create(userDto: UpdateUserDto & { userId: number }): Promise<UserDto> {
    const profile = this.profilesRepository.create({
      userId: userDto.userId,
      displayName: userDto.displayName,
      bio: userDto.bio ?? undefined,
      avatarAssetId: userDto.avatarAssetId ?? undefined,
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

  async subscribe(followerProfileId: number, followingProfileId: number): Promise<void> {
    if (followerProfileId === followingProfileId) {
      throw new BadRequestException('A profile cannot subscribe to itself.');
    }

    const follower = await this.findProfileById(followerProfileId);
    const following = await this.findProfileById(followingProfileId);

    await this.profilesRepository
      .createQueryBuilder()
      .relation(Profile, 'followingProfiles')
      .of(follower)
      .add(following);

    await this.notificationEventsProducer.emitUserSubscribed({
      followerProfileId,
      followingProfileId,
    });

    this.logger.log(`Profile ${followerProfileId} subscribed to ${followingProfileId}`);
  }

  async put(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const profile = await this.findProfileById(id);

    this.updateProfileFieldsFull(profile, updateUserDto);
    const savedProfile = await this.profilesRepository.save(profile);

    this.logger.log(`Profile fully updated: ${savedProfile.id}`);
    const savedProfileResponse = this.toUserDto(savedProfile);

    return savedProfileResponse;
  }

  private async findProfileById(id: number): Promise<Profile> {
    const profile = await this.profilesRepository.findOneBy({ id });

    if (!profile) {
      throw new NotFoundException('Profile was not found.');
    }

    return profile;
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
    Reflect.set(profile, 'bio', updateUserDto.bio ?? null);
    Reflect.set(profile, 'avatarAssetId', updateUserDto.avatarAssetId ?? null);
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
