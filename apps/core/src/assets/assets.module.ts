import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type * as Minio from 'minio';

import { Asset } from '../entities/asset.entity';
import { Profile } from '../entities/profile.entity';
import { UserEntity } from '../entities/user.entity';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { MINIO_CLIENT } from './assets.constants';
import { createOptionalMinioClient } from './minio-client.factory';
import { MinioBootstrapService } from './minio-bootstrap.service';

export { MINIO_CLIENT } from './assets.constants';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, Profile, UserEntity])],
  controllers: [AssetsController],
  providers: [
    AssetsService,
    MinioBootstrapService,
    {
      provide: MINIO_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Minio.Client | null =>
        createOptionalMinioClient(configService),
    },
  ],
  exports: [AssetsService],
})
export class AssetsModule {}
