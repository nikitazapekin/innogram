import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { AuthUserDto } from './dto/auth-user.dto';
import { CreateAuthUserDto } from './dto/create-auth-user.dto';
import { VerifyAuthUserCredentialsDto } from './dto/verify-auth-user-credentials.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async createUser(createAuthUserDto: CreateAuthUserDto): Promise<AuthUserDto> {
    const user = this.usersRepository.create({
      email: createAuthUserDto.email,
      provider: createAuthUserDto.provider,
      googleId: createAuthUserDto.googleId ?? undefined,
      passwordHash: createAuthUserDto.passwordHash ?? undefined,
    });

    let savedUser: UserEntity;

    try {
      savedUser = await this.usersRepository.save(user);
    } catch (error: unknown) {
      if (this.isUniqueConstraintViolation(error)) {
        throw new ConflictException('User already exists');
      }

      throw error;
    }

    return this.toAuthUserDto(savedUser);
  }

  async getUserByEmail(email: string): Promise<AuthUserDto | null> {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      return null;
    }

    return this.toAuthUserDto(user);
  }

  async deleteUser(id: number): Promise<void> {
    const deleteResult = await this.usersRepository.delete(id);

    if (!deleteResult.affected) {
      throw new NotFoundException('User was not found.');
    }
  }

  async verifyUserCredentials(
    verifyAuthUserCredentialsDto: VerifyAuthUserCredentialsDto,
  ): Promise<AuthUserDto | null> {
    const user = await this.usersRepository.findOneBy({
      email: verifyAuthUserCredentialsDto.email,
    });

    if (!user) {
      return null;
    }

    if (user.provider !== 'local' || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(
      verifyAuthUserCredentialsDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return null;
    }

    return this.toAuthUserDto(user);
  }

  private toAuthUserDto(user: UserEntity): AuthUserDto {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private isUniqueConstraintViolation(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    if (!this.isDriverErrorWithConstraint(error.driverError)) {
      return false;
    }

    const driverError = error.driverError;

    return driverError?.code === '23505' && driverError.constraint === 'UQ_auth_user_email';
  }

  private isDriverErrorWithConstraint(
    value: unknown,
  ): value is Readonly<{ code?: string; constraint?: string }> {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    return true;
  }
}
