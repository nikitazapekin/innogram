import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as Minio from 'minio';

import { buildAssetUrlCacheKey } from '../cache/cache-keys';
import { RedisCacheService } from '../cache/redis-cache.service';
import { Asset } from '../entities/asset.entity';
import { Profile } from '../entities/profile.entity';
import { UserEntity } from '../entities/user.entity';
import { MINIO_CLIENT } from './assets.constants';
import { AssetsService } from './assets.service';

describe('AssetsService', () => {
  let service: AssetsService;
  let redisCache: jest.Mocked<Pick<RedisCacheService, 'get' | 'set' | 'del'>>;
  let minioClient: jest.Mocked<Pick<Minio.Client, 'presignedGetObject' | 'removeObject'>>;

  const assetsRepository = {
    findOneBy: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    process.env.MINIO_BUCKET = 'test-bucket';
    delete process.env.ASSET_URL_CACHE_TTL_SECONDS;

    redisCache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      del: jest.fn().mockResolvedValue(undefined),
    };

    minioClient = {
      presignedGetObject: jest.fn().mockResolvedValue('https://minio.example/presigned'),
      removeObject: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        { provide: getRepositoryToken(Asset), useValue: assetsRepository },
        { provide: getRepositoryToken(Profile), useValue: {} },
        { provide: getRepositoryToken(UserEntity), useValue: {} },
        { provide: MINIO_CLIENT, useValue: minioClient },
        { provide: RedisCacheService, useValue: redisCache },
      ],
    }).compile();

    service = module.get(AssetsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns cached URL without calling MinIO', async () => {
    redisCache.get.mockResolvedValue('https://minio.example/cached');

    const url = await service.buildAssetUrl({ id: 42, fileName: 'photo.jpg' });

    expect(url).toBe('https://minio.example/cached');
    expect(redisCache.get).toHaveBeenCalledWith(buildAssetUrlCacheKey(42));
    expect(minioClient.presignedGetObject).not.toHaveBeenCalled();
    expect(redisCache.set).not.toHaveBeenCalled();
  });

  it('presigns and caches URL on cache miss', async () => {
    const url = await service.buildAssetUrl({ id: 7, fileName: 'video.mp4' });

    expect(url).toBe('https://minio.example/presigned');
    expect(minioClient.presignedGetObject).toHaveBeenCalledWith('test-bucket', 'video.mp4');
    expect(redisCache.set).toHaveBeenCalledWith(
      buildAssetUrlCacheKey(7),
      'https://minio.example/presigned',
      10_800,
    );
  });

  it('invalidates cache when asset is removed', async () => {
    const asset = { id: 5, fileName: 'delete-me.jpg' } as Asset;

    assetsRepository.findOneBy.mockResolvedValue(asset);
    assetsRepository.remove.mockResolvedValue(asset);

    await service.remove(5);

    expect(minioClient.removeObject).toHaveBeenCalledWith('test-bucket', 'delete-me.jpg');
    expect(redisCache.del).toHaveBeenCalledWith(buildAssetUrlCacheKey(5));
  });

  it('throws when asset is not found', async () => {
    assetsRepository.findOneBy.mockResolvedValue(null);

    await expect(service.getAssetUrl(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});
