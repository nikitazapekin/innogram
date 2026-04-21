import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PasswordService } from './password.service';
import { Profile } from '../entities/profile.entity';
import { UserEntity } from '../entities/user.entity';
import { UserDto } from './dto/user.dto';

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

    this.logger.log(`User created: ${savedUser.id}`);

    return this.toUserDto(savedUser);
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.usersRepository.find({
      relations: { profiles: true },
      order: {
        createdAt: 'DESC',
      },
    });

    return users.map((user) => this.toUserDto(user));
  }

  async findOne(id: number): Promise<UserDto> {
    const user = await this.findUserById(id);

    return this.toUserDto(user);
  }

  async update(id: number, userDto: UserDto): Promise<UserDto> {
    const user = await this.findUserById(id);
    const profile = await this.findProfileByUserId(user.id);

    this.updateProfileFieldsPartial(profile, userDto);

    await this.profilesRepository.save(profile);

    this.logger.log(`User updated: ${user.id}`);

    return this.toUserDto(user);
  }

  async remove(id: number): Promise<void> {
    await this.findUserById(id);
    await this.usersRepository.delete(id);
    this.logger.log(`User deleted: ${id}`);
  }

  async put(id: number, userDto: UserDto): Promise<UserDto> {
    const user = await this.findUserById(id);
    const profile = await this.findProfileByUserId(user.id);

    this.updateProfileFieldsFull(profile, userDto);

    await this.profilesRepository.save(profile);

    this.logger.log(`User fully updated: ${user.id}`);

    return this.toUserDto(user);
  }

  private ensureRequiredFields(userDto: UserDto): void {
    if (!userDto.email || !userDto.password) {
      throw new BadRequestException('email and password are required.');
    }
  }

  private async findUserById(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: { profiles: true },
    });

    if (!user) {
      throw new NotFoundException('User was not found.');
    }

    return user;
  }

  private async findOrCreateProfile(userId: number): Promise<Profile> {
    let profile = await this.profilesRepository.findOneBy({ userId });

    if (!profile) {
      profile = this.profilesRepository.create({ userId, displayName: '' });
      profile = await this.profilesRepository.save(profile);
    }

    return profile;
  }

  private async findProfileByUserId(userId: number): Promise<Profile> {
    const profile = await this.findOrCreateProfile(userId);

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
    if (userDto.displayName !== undefined) {
      profile.displayName = userDto.displayName;
    } else {
      profile.displayName = '';
    }

    if (userDto.bio !== undefined) {
      profile.bio = userDto.bio;
    } else {
      profile.bio = null;
    }

    if (userDto.avatarAssetId !== undefined) {
      profile.avatarAssetId = userDto.avatarAssetId;
    } else {
      profile.avatarAssetId = null;
    }
  }

  private toUserDto(user: UserEntity): UserDto {
    return {
      id: user.id,
      email: user.email,
      displayName: user.profiles?.[0]?.displayName,
      bio: user.profiles?.[0]?.bio,
      avatarAssetId: user.profiles?.[0]?.avatarAssetId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
