import { Inject, Injectable, Logger, OnModuleInit, Optional } from '@nestjs/common';
import type * as Minio from 'minio';
import { ConfigService } from '@nestjs/config';

import { MINIO_CLIENT } from './assets.constants';
import { readOptionalMinioBucket } from './minio-client.factory';

@Injectable()
export class MinioBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(MinioBootstrapService.name);
  private readonly bucketName: string | null;

  constructor(
    @Optional() @Inject(MINIO_CLIENT) private readonly minioClient: Minio.Client | null,
    configService: ConfigService,
  ) {
    this.bucketName = readOptionalMinioBucket(configService);
  }

  async onModuleInit(): Promise<void> {
    if (!this.minioClient || !this.bucketName) {
      this.logger.warn('MinIO bootstrap skipped — object storage is not configured');

      return;
    }

    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);

      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName);
        this.logger.log(`MinIO bucket "${this.bucketName}" created`);

        return;
      }

      this.logger.log(`MinIO bucket "${this.bucketName}" is ready`);
    } catch (error) {
      this.logger.error(
        'MinIO is unavailable — asset uploads will fail until storage is reachable',
        { message: error instanceof Error ? error.message : String(error) },
      );
    }
  }
}
