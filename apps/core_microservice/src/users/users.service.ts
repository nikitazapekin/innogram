import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PasswordService } from './password.service';
import { Profile } from '../entities/profile.entity';
import { UserEntity } from '../entities/user.entity';
import { UserDto } from './dto/user.dto';
import {
  DEFAULT_AVATAR_ASSET_ID,
  DEFAULT_BIO,
  DEFAULT_DISPLAY_NAME,
  USER_ERROR_MESSAGES,
  USER_LOG_MESSAGES,
  USERS_FIND_OPTIONS,
} from '../common/constants';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
    private readonly passwordService: PasswordService,
  ) {}

  async create(userDto: UserDto): Promise<UserDto> {
    this.ensureRequiredFields(userDto);

    const user = this.usersRepository.create({
      email: userDto.email!.toLowerCase(),
      passwordHash: await this.passwordService.hashPassword(userDto.password!),
    });
    const savedUser = await this.usersRepository.save(user);

    this.logger.log(`${USER_LOG_MESSAGES.CREATED}: ${savedUser.id}`);

    const savedDtoUser = this.toUserDto(savedUser);

    return savedDtoUser;
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.usersRepository.find(USERS_FIND_OPTIONS);

    return users.map((user) => this.toUserDto(user));
  }

  async findOne(id: number): Promise<UserDto> {
    const user = await this.findUserById(id);
    const profile = await this.findProfileByUserId(user.id);

    const foundUser = this.userToUserDtoWithProfile(user, profile);

    return foundUser;
  }

  async update(id: number, userDto: UserDto): Promise<UserDto> {
    const user = await this.findUserById(id);
    const profile = await this.findProfileByUserId(user.id);

    this.updateProfileFieldsPartial(profile, userDto);
    await this.profilesRepository.save(profile);

    this.logger.log(`${USER_LOG_MESSAGES.UPDATED}: ${user.id}`);

    const updatedUser = this.userToUserDtoWithProfile(user, profile);

    return updatedUser;
  }

  async remove(id: number): Promise<void> {
    await this.findUserById(id);
    await this.profilesRepository.delete({ userId: id });
    await this.usersRepository.delete(id);
    this.logger.log(`${USER_LOG_MESSAGES.DELETED}: ${id}`);
  }

  async put(id: number, userDto: UserDto): Promise<UserDto> {
    const user = await this.findUserById(id);
    const profile = await this.findProfileByUserId(user.id);

    this.updateProfileFieldsFull(profile, userDto);
    await this.profilesRepository.save(profile);

    this.logger.log(`${USER_LOG_MESSAGES.FULLY_UPDATED}: ${user.id}`);

    const updatedUser = this.userToUserDtoWithProfile(user, profile);

    return updatedUser;
  }

  private ensureRequiredFields(userDto: UserDto): void {
    if (!userDto.email || !userDto.password) {
      throw new BadRequestException(USER_ERROR_MESSAGES.REQUIRED_FIELDS);
    }
  }

  private async findUserById(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(USER_ERROR_MESSAGES.USER_NOT_FOUND);
    }

    return user;
  }

  private async findProfileByUserId(userId: number): Promise<Profile> {
    let profile = await this.profilesRepository.findOneBy({ userId });

    if (!profile) {
      profile = this.profilesRepository.create({
        userId,
        displayName: DEFAULT_DISPLAY_NAME,
      });
      profile = await this.profilesRepository.save(profile);
    }

    return profile;
  }

  private updateProfileFieldsPartial(profile: Profile, userDto: UserDto): void {
    if (userDto.displayName !== undefined) {
      profile.displayName = userDto.displayName;
    }

    if (userDto.bio !== undefined) {
      profile.bio = userDto.bio;
    }

    if (userDto.avatarAssetId !== undefined) {
      profile.avatarAssetId = userDto.avatarAssetId;
    }
  }

  private updateProfileFieldsFull(profile: Profile, userDto: UserDto): void {
    profile.displayName = userDto.displayName ?? DEFAULT_DISPLAY_NAME;
    profile.bio = userDto.bio ?? DEFAULT_BIO;
    profile.avatarAssetId = userDto.avatarAssetId ?? DEFAULT_AVATAR_ASSET_ID;
  }

  private toUserDto(user: UserEntity): UserDto {
    const profile = user.profiles?.[0];

    return {
      id: user.id,
      email: user.email,
      displayName: profile?.displayName ?? DEFAULT_DISPLAY_NAME,
      bio: profile?.bio ?? DEFAULT_BIO,
      avatarAssetId: profile?.avatarAssetId ?? DEFAULT_AVATAR_ASSET_ID,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private userToUserDtoWithProfile(user: UserEntity, profile: Profile): UserDto {
    return {
      id: user.id,
      email: user.email,
      displayName: profile?.displayName ?? DEFAULT_DISPLAY_NAME,
      bio: profile?.bio ?? DEFAULT_BIO,
      avatarAssetId: profile?.avatarAssetId ?? DEFAULT_AVATAR_ASSET_ID,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
