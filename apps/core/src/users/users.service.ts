import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Account } from '../entities/account.entity';
import { Profile } from '../entities/profile.entity';
import { UserEntity } from '../entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

export type AuthUserDto = Readonly<{
  accountId: string | null;
  createdAt: Date;
  email: string;
  id: number;
  passwordHash: string;
  updatedAt: Date;
}>;

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(Account)
    private readonly accountsRepository: Repository<Account>,
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findUserByEmail(email: string): Promise<AuthUserDto | null> {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      return null;
    }

    const account = await this.accountsRepository.findOneBy({ userId: user.id });

    return this.toAuthUserDto(user, account);
  }

  async createAuthUser(email: string, passwordHash: string): Promise<AuthUserDto> {
    const user = this.usersRepository.create({
      email,
      passwordHash,
    });
    const savedUser = await this.usersRepository.save(user);

    const account = this.accountsRepository.create({
      userId: savedUser.id,
    });
    const savedAccount = await this.accountsRepository.save(account);

    this.logger.log(`Auth user created: ${savedUser.id}`);

    return this.toAuthUserDto(savedUser, savedAccount);
  }

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

  private toAuthUserDto(user: UserEntity, account: Account | null): AuthUserDto {
    return {
      accountId: account?.id ?? null,
      createdAt: user.createdAt,
      email: user.email,
      id: user.id,
      passwordHash: user.passwordHash,
      updatedAt: user.updatedAt,
    };
  }
}
