import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';

import { UserEntity } from '../entities/user.entity';
import { AuthService } from './auth.service';
import { CreateAuthUserDto } from './dto/create-auth-user.dto';
import { VerifyAuthUserCredentialsDto } from './dto/verify-auth-user-credentials.dto';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<
    Pick<Repository<UserEntity>, 'create' | 'save' | 'findOneBy' | 'delete'>
  >;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    provider: 'local' as const,
    googleId: null as string | null,
    passwordHash: 'hashed_password',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    accounts: [],
  } as UserEntity;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersRepository = module.get(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    const createDto: CreateAuthUserDto = {
      email: 'test@example.com',
      provider: 'local',
      passwordHash: 'hashed_password',
    };

    it('should create and return a user', async () => {
      usersRepository.create.mockReturnValue(mockUser);
      usersRepository.save.mockResolvedValue(mockUser);

      const result = await service.createUser(createDto);

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(usersRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        provider: 'local',
        googleId: undefined,
        passwordHash: 'hashed_password',
      });
      expect(usersRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should handle optional googleId', async () => {
      const googleDto: CreateAuthUserDto = {
        email: 'google@example.com',
        provider: 'google',
        googleId: 'google_123',
      };

      const googleUser = {
        ...mockUser,
        email: 'google@example.com',
        provider: 'google' as const,
        googleId: 'google_123',
      };
      usersRepository.create.mockReturnValue(googleUser);
      usersRepository.save.mockResolvedValue(googleUser);

      const result = await service.createUser(googleDto);

      expect(result.email).toBe('google@example.com');
      expect(usersRepository.create).toHaveBeenCalledWith({
        email: 'google@example.com',
        provider: 'google',
        googleId: 'google_123',
        passwordHash: undefined,
      });
    });

    it('should throw ConflictException on unique constraint violation', async () => {
      const driverError = new Error('duplicate key') as any;
      driverError.code = '23505';
      driverError.constraint = 'UQ_auth_user_email';

      const queryError = new QueryFailedError('INSERT INTO', [], driverError);

      usersRepository.create.mockReturnValue(mockUser);
      usersRepository.save.mockRejectedValue(queryError);

      await expect(service.createUser(createDto)).rejects.toThrow(ConflictException);
    });

    it('should rethrow non-constraint errors', async () => {
      const dbError = new Error('Database connection lost');

      usersRepository.create.mockReturnValue(mockUser);
      usersRepository.save.mockRejectedValue(dbError);

      await expect(service.createUser(createDto)).rejects.toThrow('Database connection lost');
    });

    it('should rethrow QueryFailedError with different code', async () => {
      const driverError = new Error('other error') as any;
      driverError.code = '42P01';

      const queryError = new QueryFailedError('INSERT INTO', [], driverError);

      usersRepository.create.mockReturnValue(mockUser);
      usersRepository.save.mockRejectedValue(queryError);

      await expect(service.createUser(createDto)).rejects.toThrow(QueryFailedError);
    });

    it('should rethrow QueryFailedError with different constraint', async () => {
      const driverError = new Error('other constraint') as any;
      driverError.code = '23505';
      driverError.constraint = 'UQ_other';

      const queryError = new QueryFailedError('INSERT INTO', [], driverError);

      usersRepository.create.mockReturnValue(mockUser);
      usersRepository.save.mockRejectedValue(queryError);

      await expect(service.createUser(createDto)).rejects.toThrow(QueryFailedError);
    });
  });

  describe('getUserByEmail', () => {
    it('should return user DTO when found', async () => {
      usersRepository.findOneBy.mockResolvedValue(mockUser);

      const result = await service.getUserByEmail('test@example.com');

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should return null when user not found', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);

      const result = await service.getUserByEmail('notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      usersRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      await expect(service.deleteUser(1)).resolves.toBeUndefined();
      expect(usersRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when user not found', async () => {
      usersRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      await expect(service.deleteUser(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyUserCredentials', () => {
    const creds: VerifyAuthUserCredentialsDto = {
      email: 'test@example.com',
      password: 'correct_password',
    };

    it('should return user DTO on valid credentials', async () => {
      usersRepository.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyUserCredentials(creds);

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('correct_password', 'hashed_password');
    });

    it('should return null when user not found', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);

      const result = await service.verifyUserCredentials(creds);

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when provider is not local', async () => {
      const googleUser = {
        ...mockUser,
        provider: 'google' as const,
        passwordHash: null,
      } as unknown as UserEntity;
      usersRepository.findOneBy.mockResolvedValue(googleUser);

      const result = await service.verifyUserCredentials(creds);

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when user has no passwordHash', async () => {
      const noPasswordUser = { ...mockUser, passwordHash: null } as unknown as UserEntity;
      usersRepository.findOneBy.mockResolvedValue(noPasswordUser);

      const result = await service.verifyUserCredentials(creds);

      expect(result).toBeNull();
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null on incorrect password', async () => {
      usersRepository.findOneBy.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.verifyUserCredentials(creds);

      expect(result).toBeNull();
    });
  });
});
