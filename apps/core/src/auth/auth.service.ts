import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { AuthUserDto } from './dto/auth-user.dto';
import { CreateAuthUserDto } from './dto/create-auth-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async createUser(createAuthUserDto: CreateAuthUserDto): Promise<AuthUserDto> {
    const user = this.usersRepository.create({
      email: createAuthUserDto.email,
      passwordHash: createAuthUserDto.passwordHash,
    });
    const savedUser = await this.usersRepository.save(user);

    return this.toAuthUserDto(savedUser);
  }

  async getUserByEmail(email: string): Promise<AuthUserDto | null> {
    const user = await this.usersRepository.findOneBy({ email });

    if (!user) {
      return null;
    }

    return this.toAuthUserDto(user);
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
