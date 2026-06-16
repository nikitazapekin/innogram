import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';

import { readRequiredEnv } from '../common/read-required-env';
import { MINIO_CLIENT } from './assets.constants';

@Injectable()
export class MinioBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(MinioBootstrapService.name);
  private readonly bucketName: string;

  constructor(@Inject(MINIO_CLIENT) private readonly minioClient: Minio.Client) {
    this.bucketName = readRequiredEnv('MINIO_BUCKET');
  }

  async onModuleInit(): Promise<void> {
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
        'MinIO is unavailable — start it with `docker compose up -d minio` before uploading assets',
        { message: error instanceof Error ? error.message : String(error) },
      );
    }
  }
}
