import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Minio from 'minio';

import { Asset } from '../entities/asset.entity';
import { Profile } from '../entities/profile.entity';
import { UserEntity } from '../entities/user.entity';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { MinioBootstrapService } from './minio-bootstrap.service';

export const MINIO_CLIENT = 'MINIO_CLIENT';

@Module({
  imports: [TypeOrmModule.forFeature([Asset, Profile, UserEntity])],
  controllers: [AssetsController],
  providers: [
    AssetsService,
    MinioBootstrapService,
    {
      provide: MINIO_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Minio.Client =>
        new Minio.Client({
          endPoint: configService.getOrThrow('MINIO_ENDPOINT'),
          port: Number(configService.getOrThrow('MINIO_PORT')),
          accessKey: configService.getOrThrow('MINIO_ACCESS_KEY'),
          secretKey: configService.getOrThrow('MINIO_SECRET_KEY'),
          useSSL: configService.get('MINIO_USE_SSL') === 'true',
        }),
    },
  ],
  exports: [AssetsService],
})
export class AssetsModule {}
