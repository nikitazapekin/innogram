import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PasswordService } from './password.service';
import { User } from '../entities/user.entity';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
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

    return users.map((user) => this.toUserDto(user));
  }

  async findOne(id: number): Promise<UserDto> {
    const user = (await this.usersRepository.findOne({
      where: { id },
    }))!;

    return this.toUserDto(user);
  }

  async update(id: number, userDto: UserDto): Promise<UserDto> {
    const user = (await this.usersRepository.findOne({
      where: { id },
    }))!;

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
    await this.usersRepository.delete(id);
    this.logger.log(`User deleted: ${id}`);
  }

  async put(id: number, userDto: UserDto): Promise<UserDto> {
    const user = (await this.usersRepository.findOne({
      where: { id },
    }))!;

    user.email = userDto.email!.toLowerCase();
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

  private toUserDto(user: User): UserDto {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
