import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Optional,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream } from 'node:fs';
import { unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import * as Minio from 'minio';
import { Repository } from 'typeorm';
import 'multer';

import { sanitizeUploadFileName } from '../common/upload/upload.config';

import { buildAssetUrlCacheKey } from '../cache/cache-keys';
import { RedisCacheService } from '../cache/redis-cache.service';
import { Asset } from '../entities/asset.entity';
import { Profile } from '../entities/profile.entity';
import { UserEntity } from '../entities/user.entity';
import { MINIO_CLIENT } from './assets.constants';
import { readOptionalMinioBucket } from './minio-client.factory';
import { AssetDto } from './dto/asset.dto';

const DEFAULT_ASSET_URL_CACHE_TTL_SECONDS = 3 * 60 * 60;

@Injectable()
export class AssetsService {
  private readonly bucketName: string | null;
  private readonly assetUrlCacheTtlSeconds: number;

  constructor(
    @InjectRepository(Asset)
    private readonly assetsRepository: Repository<Asset>,
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @Optional() @Inject(MINIO_CLIENT) private readonly minioClient: Minio.Client | null,
    private readonly redisCache: RedisCacheService,
    configService: ConfigService,
  ) {
    this.bucketName = readOptionalMinioBucket(configService);
    this.assetUrlCacheTtlSeconds = this.readAssetUrlCacheTtlSeconds();
  }

  async getAssetUrl(id: number): Promise<string> {
    const asset = await this.findAssetById(id);

    return this.buildAssetUrl(asset);
  }

  async buildAssetUrl(asset: Pick<Asset, 'id' | 'fileName'>): Promise<string> {
    const minioClient = this.requireMinioClient();

    const cacheKey = buildAssetUrlCacheKey(asset.id);
    const cachedUrl = await this.redisCache.get(cacheKey);

    if (cachedUrl) {
      return cachedUrl;
    }

    const url = await minioClient.presignedGetObject(this.bucketName!, asset.fileName);

    await this.redisCache.set(cacheKey, url, this.assetUrlCacheTtlSeconds);

    return url;
  }

  async uploadFile(file: Express.Multer.File | undefined, userEmail: string): Promise<AssetDto> {
    if (!file?.path) {
      throw new BadRequestException('Uploaded file is empty.');
    }

    if (!file.size) {
      throw new BadRequestException('Uploaded file is empty.');
    }

    const tempFilePath = file.path;

    try {
      const user = await this.usersRepository.findOneBy({ email: userEmail });

      if (!user) {
        throw new UnauthorizedException('Authenticated user was not found.');
      }

      const profile = await this.profilesRepository.findOneBy({ userId: user.id });
      const objectName = `${randomUUID()}-${sanitizeUploadFileName(file.originalname)}`;

      await this.uploadStreamToMinio(objectName, tempFilePath, file.size, file.mimetype);

      const asset = this.assetsRepository.create({
        ownerProfileId: profile?.id ?? null,
        fileName: objectName,
        mimeType: file.mimetype,
      });

      const savedAsset = await this.assetsRepository.save(asset);

      return this.toAssetDto(savedAsset);
    } finally {
      await unlink(tempFilePath).catch(() => undefined);
    }
  }

  async remove(id: number): Promise<void> {
    const asset = await this.findAssetById(id);
    const minioClient = this.requireMinioClient();

    await minioClient.removeObject(this.bucketName!, asset.fileName);
    await this.assetsRepository.remove(asset);
    await this.redisCache.del(buildAssetUrlCacheKey(id));
  }

  private requireMinioClient(): Minio.Client {
    if (!this.minioClient || !this.bucketName) {
      throw new ServiceUnavailableException(
        'Object storage is not configured. Set MINIO_* environment variables to enable uploads.',
      );
    }

    return this.minioClient;
  }

  private async uploadStreamToMinio(
    objectName: string,
    filePath: string,
    size: number,
    mimeType: string,
  ): Promise<void> {
    const minioClient = this.requireMinioClient();
    const stream = createReadStream(filePath);

    try {
      await minioClient.putObject(this.bucketName!, objectName, stream, size, {
        'Content-Type': mimeType,
      });
    } catch (error) {
      stream.destroy();

      throw error;
    }
  }

  private async findAssetById(id: number): Promise<Asset> {
    const asset = await this.assetsRepository.findOneBy({ id });

    if (!asset) {
      throw new NotFoundException('Asset was not found.');
    }

    return asset;
  }

  private readAssetUrlCacheTtlSeconds(): number {
    const rawTtl = process.env.ASSET_URL_CACHE_TTL_SECONDS;

    if (!rawTtl) {
      return DEFAULT_ASSET_URL_CACHE_TTL_SECONDS;
    }

    const ttlSeconds = Number(rawTtl);

    if (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0) {
      throw new Error('ASSET_URL_CACHE_TTL_SECONDS must be a positive integer.');
    }

    return ttlSeconds;
  }

  private toAssetDto(asset: Asset): AssetDto {
    return {
      id: asset.id,
      ownerProfileId: asset.ownerProfileId,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    };
  }
}
