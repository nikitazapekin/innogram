import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, scrypt as scryptCallback } from 'crypto';
import { promisify } from 'util';
import { Repository } from 'typeorm';

import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PutUserDto } from './dto/put-user.dto';
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

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    return UserResponseDto.fromEntity(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    if (updateUserDto.email !== undefined) {
      user.email = updateUserDto.email.toLowerCase();
    }

    if (updateUserDto.password !== undefined) {
      user.passwordHash = await this.hashPassword(updateUserDto.password);
    }

    const updatedUser = await this.usersRepository.save(user);

    this.logger.log(`User updated: ${updatedUser.id}`);

    return UserResponseDto.fromEntity(updatedUser);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
    this.logger.log(`User deleted: ${id}`);
  }

  async put(id: number, putUserDto: PutUserDto): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${id}" not found`);
    }

    user.email = putUserDto.email.toLowerCase();
    user.passwordHash = await this.hashPassword(putUserDto.password);

    const updatedUser = await this.usersRepository.save(user);

    this.logger.log(`User fully updated: ${updatedUser.id}`);

    return UserResponseDto.fromEntity(updatedUser);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await this.scrypt(password, salt, 64)) as Buffer;

    return `${salt}:${derivedKey.toString('hex')}`;
  }
}
