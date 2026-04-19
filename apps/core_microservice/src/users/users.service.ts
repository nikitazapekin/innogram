import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PasswordService } from '../auth/password.service';
import { User } from '../entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { PutUserDto } from './dto/put-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { toUserResponse } from './mappers/user-response.mapper';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly passwordService: PasswordService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = this.usersRepository.create({
      email: createUserDto.email.toLowerCase(),
      passwordHash: await this.passwordService.hashPassword(createUserDto.password),
    });
    const savedUser = await this.usersRepository.save(user);

    this.logger.log(`User created: ${savedUser.id}`);

    return toUserResponse(savedUser);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });

    return users.map(toUserResponse);
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = (await this.usersRepository.findOne({
      where: { id },
    }))!;

    return toUserResponse(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {
    const user = (await this.usersRepository.findOne({
      where: { id },
    }))!;

    if (updateUserDto.email) {
      user.email = updateUserDto.email.toLowerCase();
    }

    if (updateUserDto.password) {
      user.passwordHash = await this.passwordService.hashPassword(updateUserDto.password);
    }

    const updatedUser = await this.usersRepository.save(user);

    this.logger.log(`User updated: ${updatedUser.id}`);

    return toUserResponse(updatedUser);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
    this.logger.log(`User deleted: ${id}`);
  }

  async put(id: number, putUserDto: PutUserDto): Promise<UserResponseDto> {
    const user = (await this.usersRepository.findOne({
      where: { id },
    }))!;

    user.email = putUserDto.email.toLowerCase();
    user.passwordHash = await this.passwordService.hashPassword(putUserDto.password);

    const updatedUser = await this.usersRepository.save(user);

    this.logger.log(`User fully updated: ${updatedUser.id}`);

    return toUserResponse(updatedUser);
  }
}
