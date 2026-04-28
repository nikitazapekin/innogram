import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { AuthUserDto } from './dto/auth-user.dto';
import { SaveAuthUserDto } from './dto/save-auth-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async findUserByEmail(email: string): Promise<AuthUserDto> {
    const normalizedEmail = this.normalizeEmail(email);
    const user = await this.findUserByNormalizedEmail(normalizedEmail);

    if (!user) {
      throw new NotFoundException('User was not found.');
    }

    return this.toAuthUserDto(user);
  }

  async createPasswordUser(saveAuthUserDto: SaveAuthUserDto): Promise<AuthUserDto> {
    const normalizedEmail = this.normalizeEmail(saveAuthUserDto.email);
    const existingUser = await this.findUserByNormalizedEmail(normalizedEmail);

    if (existingUser) {
      throw new ConflictException('User with this email already exists.');
    }

    const user = this.usersRepository.create({
      email: normalizedEmail,
      passwordHash: saveAuthUserDto.passwordHash,
    });
    const savedUser = await this.usersRepository.save(user);

    this.logger.log(`Password user created: ${savedUser.id}`);

    return this.toAuthUserDto(savedUser);
  }

  async upsertOAuthUser(saveAuthUserDto: SaveAuthUserDto): Promise<AuthUserDto> {
    const normalizedEmail = this.normalizeEmail(saveAuthUserDto.email);
    const existingUser = await this.findUserByNormalizedEmail(normalizedEmail);

    if (existingUser) {
      return this.toAuthUserDto(existingUser);
    }

    const user = this.usersRepository.create({
      email: normalizedEmail,
      passwordHash: saveAuthUserDto.passwordHash,
    });
    const savedUser = await this.usersRepository.save(user);

    this.logger.log(`OAuth user created: ${savedUser.id}`);

    return this.toAuthUserDto(savedUser);
  }

  private findUserByNormalizedEmail(email: string): Promise<UserEntity | null> {
    return this.usersRepository.findOneBy({ email });
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private toAuthUserDto(user: UserEntity): AuthUserDto {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
