import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import * as Minio from 'minio';
import { Repository } from 'typeorm';

import { Asset } from '../entities/asset.entity';
import { Profile } from '../entities/profile.entity';
import { UserEntity } from '../entities/user.entity';
import { MINIO_CLIENT } from './assets.module';
import { AssetDto } from './dto/asset.dto';

@Injectable()
export class AssetsService {
  private readonly bucketName: string;

  constructor(
    @InjectRepository(Asset)
    private readonly assetsRepository: Repository<Asset>,
    @InjectRepository(Profile)
    private readonly profilesRepository: Repository<Profile>,
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @Inject(MINIO_CLIENT)
    private readonly minioClient: Minio.Client,
  ) {
    this.bucketName = process.env.MINIO_BUCKET ?? 'main';
  }

  async getAssetUrl(id: number): Promise<string> {
    const asset = await this.findAssetById(id);

    return this.minioClient.presignedGetObject(this.bucketName, asset.fileName);
  }

  async uploadFile(file: Express.Multer.File, userEmail: string): Promise<AssetDto> {
    if (!file.buffer?.length) {
      throw new BadRequestException('Uploaded file is empty.');
    }

    const user = await this.usersRepository.findOneBy({ email: userEmail });

    if (!user) {
      throw new UnauthorizedException('Authenticated user was not found.');
    }

    const profile = await this.profilesRepository.findOneBy({ id: user.id });
    const objectName = `${randomUUID()}-${file.originalname}`;

    await this.minioClient.putObject(this.bucketName, objectName, file.buffer, file.size, {
      'Content-Type': file.mimetype,
    });

    const asset = this.assetsRepository.create({
      ownerProfileId: profile?.id ?? null,
      fileName: objectName,
      mimeType: file.mimetype,
    });

    const savedAsset = await this.assetsRepository.save(asset);

    return this.toAssetDto(savedAsset);
  }

  private async findAssetById(id: number): Promise<Asset> {
    const asset = await this.assetsRepository.findOneBy({ id });

    if (!asset) {
      throw new NotFoundException('Asset was not found.');
    }

    return asset;
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
