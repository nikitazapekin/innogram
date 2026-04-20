import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PasswordService } from './password.service';
import { UserEntity } from '../entities/user.entity';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
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
      order: {
        createdAt: 'DESC',
      },
    });

    const mappedUsers = users.map((user) => this.toUserDto(user));

    return mappedUsers;
  }

  async findOne(id: number): Promise<UserDto> {
    const user = await this.findUserById(id);

    return this.toUserDto(user);
  }

  async update(id: number, userDto: UserDto): Promise<UserDto> {
    const user = await this.findUserById(id);

    if (userDto.email) {
      user.email = userDto.email.toLowerCase();
    }

    if (userDto.password) {
      user.passwordHash = await this.passwordService.hashPassword(userDto.password);
    }

    const updatedUser = await this.usersRepository.save(user);

    this.logger.log(`User updated: ${updatedUser.id}`);

    return this.toUserDto(updatedUser);
  }

  async remove(id: number): Promise<void> {
    await this.findUserById(id);
    await this.usersRepository.delete(id);
    this.logger.log(`User deleted: ${id}`);
  }

  async put(id: number, userDto: UserDto): Promise<UserDto> {
    const user = await this.findUserById(id);

    user.email = userDto.email!;
    user.passwordHash = await this.passwordService.hashPassword(userDto.password!);

    const updatedUser = await this.usersRepository.save(user);

    this.logger.log(`User fully updated: ${updatedUser.id}`);

    return this.toUserDto(updatedUser);
  }

  private ensureRequiredFields(userDto: UserDto): void {
    if (!userDto.email || !userDto.password) {
      throw new BadRequestException('email and password are required.');
    }
  }

  private async findUserById(id: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException('User was not found.');
    }

    return user;
  }

  private toUserDto(user: UserEntity): UserDto {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
