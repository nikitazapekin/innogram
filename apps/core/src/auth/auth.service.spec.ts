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

const { compare: mockCompare } = jest.requireMock<{ compare: jest.Mock }>('bcrypt');

function mockUser(): UserEntity {
  const user = new UserEntity();
  user.id = 1;
  user.email = 'test@example.com';
  user.provider = 'local';
  user.googleId = '';
  user.passwordHash = 'hashed_password';
  user.createdAt = new Date('2024-01-01');
  user.updatedAt = new Date('2024-01-01');
  user.accounts = [];
  return user;
}

function conflictError(): QueryFailedError {
  return new QueryFailedError(
    'INSERT INTO',
    [],
    Object.assign(new Error('duplicate key'), {
      code: '23505',
      constraint: 'UQ_auth_user_email',
    }),
  );
}

function queryErrorWithCode(code: string): QueryFailedError {
  return new QueryFailedError(
    'INSERT INTO',
    [],
    Object.assign(new Error('driver error'), { code }),
  );
}

function queryErrorWithConstraint(constraint: string): QueryFailedError {
  return new QueryFailedError(
    'INSERT INTO',
    [],
    Object.assign(new Error('driver error'), {
      code: '23505',
      constraint,
    }),
  );
}

describe('AuthService', () => {
  let service: AuthService;
  let usersRepository: jest.Mocked<
    Pick<Repository<UserEntity>, 'create' | 'save' | 'findOneBy' | 'delete'>
  >;

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
      const user = mockUser();
      usersRepository.create.mockReturnValue(user);
      usersRepository.save.mockResolvedValue(user);

      const result = await service.createUser(createDto);

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
      expect(usersRepository.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        provider: 'local',
        googleId: undefined,
        passwordHash: 'hashed_password',
      });
      expect(usersRepository.save).toHaveBeenCalledWith(user);
    });

    it('should handle optional googleId', async () => {
      const googleDto: CreateAuthUserDto = {
        email: 'google@example.com',
        provider: 'google',
        googleId: 'google_123',
      };

      const googleUser = mockUser();
      googleUser.email = 'google@example.com';
      googleUser.provider = 'google';
      googleUser.googleId = 'google_123';

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
      const user = mockUser();
      usersRepository.create.mockReturnValue(user);
      usersRepository.save.mockRejectedValue(conflictError());

      await expect(service.createUser(createDto)).rejects.toThrow(ConflictException);
    });

    it('should rethrow non-constraint errors', async () => {
      const user = mockUser();
      const dbError = new Error('Database connection lost');

      usersRepository.create.mockReturnValue(user);
      usersRepository.save.mockRejectedValue(dbError);

      await expect(service.createUser(createDto)).rejects.toThrow('Database connection lost');
    });

    it('should rethrow QueryFailedError with different code', async () => {
      const user = mockUser();
      usersRepository.create.mockReturnValue(user);
      usersRepository.save.mockRejectedValue(queryErrorWithCode('42P01'));

      await expect(service.createUser(createDto)).rejects.toThrow(QueryFailedError);
    });

    it('should rethrow QueryFailedError with different constraint', async () => {
      const user = mockUser();
      usersRepository.create.mockReturnValue(user);
      usersRepository.save.mockRejectedValue(queryErrorWithConstraint('UQ_other'));

      await expect(service.createUser(createDto)).rejects.toThrow(QueryFailedError);
    });
  });

  describe('getUserByEmail', () => {
    it('should return user DTO when found', async () => {
      const user = mockUser();
      usersRepository.findOneBy.mockResolvedValue(user);

      const result = await service.getUserByEmail('test@example.com');

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
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
      const user = mockUser();
      usersRepository.findOneBy.mockResolvedValue(user);
      mockCompare.mockResolvedValue(true);

      const result = await service.verifyUserCredentials(creds);

      expect(result).toEqual({
        id: 1,
        email: 'test@example.com',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
      expect(mockCompare).toHaveBeenCalledWith('correct_password', 'hashed_password');
    });

    it('should return null when user not found', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);

      const result = await service.verifyUserCredentials(creds);

      expect(result).toBeNull();
      expect(mockCompare).not.toHaveBeenCalled();
    });

    it('should return null when provider is not local', async () => {
      const googleUser = mockUser();
      googleUser.provider = 'google';

      usersRepository.findOneBy.mockResolvedValue(googleUser);

      const result = await service.verifyUserCredentials(creds);

      expect(result).toBeNull();
      expect(mockCompare).not.toHaveBeenCalled();
    });

    it('should return null when user has no passwordHash', async () => {
      const noPasswordUser = mockUser();
      noPasswordUser.passwordHash = '';

      usersRepository.findOneBy.mockResolvedValue(noPasswordUser);

      const result = await service.verifyUserCredentials(creds);

      expect(result).toBeNull();
      expect(mockCompare).not.toHaveBeenCalled();
    });

    it('should return null on incorrect password', async () => {
      const user = mockUser();
      usersRepository.findOneBy.mockResolvedValue(user);
      mockCompare.mockResolvedValue(false);

      const result = await service.verifyUserCredentials(creds);

      expect(result).toBeNull();
    });
  });
});
