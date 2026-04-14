import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, scrypt as scryptCallback } from 'crypto';
import { promisify } from 'util';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly scrypt = promisify(scryptCallback);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    await this.ensureEmailIsAvailable(createUserDto.email);

    const user = this.usersRepository.create({
      email: createUserDto.email.toLowerCase(),
      passwordHash: await this.hashPassword(createUserDto.password),
    });
    const savedUser = await this.usersRepository.save(user);

    this.logger.log(`User created: ${savedUser.id}`);

    return UserResponseDto.fromEntity(savedUser);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return users.map(UserResponseDto.fromEntity);
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return UserResponseDto.fromEntity(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    if (updateUserDto.email && updateUserDto.email.toLowerCase() !== user.email) {
      await this.ensureEmailIsAvailable(updateUserDto.email, id);
      user.email = updateUserDto.email.toLowerCase();
    }

    if (updateUserDto.password) {
      user.passwordHash = await this.hashPassword(updateUserDto.password);
    }

    const updatedUser = await this.usersRepository.save(user);

    this.logger.log(`User updated: ${updatedUser.id}`);

    return UserResponseDto.fromEntity(updatedUser);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);

    if (!result.affected) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    this.logger.log(`User deleted: ${id}`);
  }

  private async ensureEmailIsAvailable(email: string, excludeUserId?: string): Promise<void> {
    const normalizedEmail = email.toLowerCase();
    const existingUser = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser && existingUser.id !== excludeUserId) {
      throw new ConflictException(`User with email "${normalizedEmail}" already exists`);
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await this.scrypt(password, salt, 64)) as Buffer;

    return `${salt}:${derivedKey.toString('hex')}`;
  }
}
