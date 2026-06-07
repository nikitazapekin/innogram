import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { FollowRequest, FollowRequestStatus } from '../entities/follow-request.entity';
import { Post } from '../entities/post.entity';
import { Profile } from '../entities/profile.entity';
import { UserEntity } from '../entities/user.entity';
import { NotificationEventsProducer } from '../kafka/notification-events.producer';
import { FollowRequestDto } from './dto/follow-request.dto';
import { PostDto } from '../posts/dto/post.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
    @InjectRepository(FollowRequest)
    private readonly followRequestRepository: Repository<FollowRequest>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private readonly notificationEventsProducer: NotificationEventsProducer,
  ) {}

  async create(userDto: UpdateUserDto): Promise<UserDto> {
    const profile = this.profilesRepository.create({
      userId: userDto.userId!,
      displayName: userDto.displayName,
      bio: userDto.bio ?? undefined,
      avatarAssetId: userDto.avatarAssetId ?? undefined,
    });

    const savedProfile = await this.profilesRepository.save(profile);

    this.logger.log(`Profile created: ${savedProfile.id}`);
    const savedProfileResponse = this.toUserDto(savedProfile);

    return savedProfileResponse;
  }

  async findByEmail(email: string): Promise<UserDto> {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      throw new NotFoundException('User was not found.');
    }

    let profile = await this.profilesRepository.findOneBy({ userId: user.id });

    if (!profile) {
      profile = this.profilesRepository.create({
        userId: user.id,
        displayName: email.split('@')[0],
      });

      profile = await this.profilesRepository.save(profile);

      this.logger.log(`Profile auto-created for user: ${email}`);
    }

    return this.toUserDto(profile);
  }

  async getPostsByProfileId(profileId: number): Promise<PostDto[]> {
    const profile = await this.profilesRepository.findOneBy({ id: profileId });

    if (!profile) {
      throw new NotFoundException('Profile was not found.');
    }

    const posts = await this.postsRepository.find({
      where: { authorProfileId: profile.userId },
      order: { createdAt: 'DESC' },
    });

    return posts.map((post) => ({
      id: post.id,
      authorProfileId: post.authorProfileId,
      title: post.title,
      content: post.content,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      isArchived: false,
      archivedAt: null,
    }));
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

  async findFollowers(id: number): Promise<UserDto[]> {
    await this.findProfileById(id);

    const followers = await this.profilesRepository
      .createQueryBuilder('profile')
      .relation(Profile, 'followers')
      .of(id)
      .loadMany<Profile>();

    const followersList = followers.map((profile) => this.toUserDto(profile));

    return followersList;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const profile = await this.findProfileById(id);

    this.updateProfileFieldsPartial(profile, updateUserDto);
    const savedProfile = await this.profilesRepository.save(profile);

    this.logger.log(`Profile updated: ${savedProfile.id}`);
    const savedProfileResponse = this.toUserDto(savedProfile);

    return savedProfileResponse;
  }

  async updateProfile(email: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    const profile = await this.profilesRepository.findOneBy({ userId: user.id });

    if (!profile) {
      throw new NotFoundException('Profile not found.');
    }

    this.updateProfileFieldsPartial(profile, updateUserDto);
    const savedProfile = await this.profilesRepository.save(profile);

    this.logger.log(`Profile updated: ${savedProfile.id}`);

    return this.toUserDto(savedProfile);
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

  async followProfile(followerId: number, followingId: number): Promise<FollowRequestDto | void> {
    this.ensureDifferentProfileIds(followerId, followingId);

    const targetProfile = await this.findProfileById(followingId);

    if (targetProfile.isPrivate) {
      const existing = await this.followRequestRepository.findOneBy({
        followerProfileId: followerId,
        followingProfileId: followingId,
        status: FollowRequestStatus.PENDING,
      });

      if (existing) {
        throw new ConflictException('Follow request already exists.');
      }

      const request = this.followRequestRepository.create({
        followerProfileId: followerId,
        followingProfileId: followingId,
        status: FollowRequestStatus.PENDING,
      });

      const saved = await this.followRequestRepository.save(request);

      return this.toFollowRequestDto(saved);
    }

    await this.profilesRepository
      .createQueryBuilder()
      .relation(Profile, 'followingProfiles')
      .of(followerId)
      .add(followingId);

    await this.notificationEventsProducer.emitUserSubscribed({
      followerProfileId: followerId,
      followingProfileId: followingId,
    });

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

  async getPendingFollowRequests(profileId: number): Promise<FollowRequestDto[]> {
    await this.findProfileById(profileId);

    const requests = await this.followRequestRepository.find({
      where: {
        followingProfileId: profileId,
        status: FollowRequestStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });
    const pendingRequests = requests.map((r) => this.toFollowRequestDto(r));

    return pendingRequests;
  }

  async respondToFollowRequest(
    requestId: number,
    profileId: number,
    status: FollowRequestStatus.APPROVED | FollowRequestStatus.REJECTED,
  ): Promise<FollowRequestDto> {
    const request = await this.followRequestRepository.findOneBy({ id: requestId });

    if (!request) {
      throw new NotFoundException('Follow request was not found.');
    }

    if (request.followingProfileId !== profileId) {
      throw new BadRequestException('You can only respond to your own follow requests.');
    }

    if (request.status !== FollowRequestStatus.PENDING) {
      throw new BadRequestException('Follow request has already been processed.');
    }

    request.status = status;
    const saved = await this.followRequestRepository.save(request);

    if (status === FollowRequestStatus.APPROVED) {
      await this.profilesRepository
        .createQueryBuilder()
        .relation(Profile, 'followingProfiles')
        .of(request.followerProfileId)
        .add(request.followingProfileId);

      await this.notificationEventsProducer.emitUserSubscribed({
        followerProfileId: request.followerProfileId,
        followingProfileId: request.followingProfileId,
      });
    }

    return this.toFollowRequestDto(saved);
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
    const { displayName, bio, avatarAssetId, isPrivate } = updateUserDto;

    if (!displayName && !bio && !avatarAssetId && isPrivate === undefined) {
      return;
    }

    profile.displayName = displayName ?? profile.displayName;
    profile.bio = bio ?? profile.bio;
    profile.avatarAssetId = avatarAssetId ?? profile.avatarAssetId;
    profile.isPrivate = isPrivate ?? profile.isPrivate;
  }

  private updateProfileFieldsFull(profile: Profile, updateUserDto: UpdateUserDto): void {
    profile.displayName = updateUserDto.displayName;
    profile.bio = updateUserDto.bio ?? '';
    profile.avatarAssetId = updateUserDto.avatarAssetId ?? 0;
    profile.isPrivate = updateUserDto.isPrivate ?? false;
  }

  private toUserDto(profile: Profile): UserDto {
    return {
      id: profile.id,
      displayName: profile.displayName,
      bio: profile.bio ?? undefined,
      avatarAssetId: profile.avatarAssetId,
      isPrivate: profile.isPrivate,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  private toFollowRequestDto(request: FollowRequest): FollowRequestDto {
    return {
      id: request.id,
      followerProfileId: request.followerProfileId,
      followingProfileId: request.followingProfileId,
      status: request.status,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }
}
