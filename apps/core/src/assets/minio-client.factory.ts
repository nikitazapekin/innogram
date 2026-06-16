import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

const logger = new Logger('MinioClientFactory');

const PLACEHOLDER_PATTERN = /<[^>]+>|account-id/i;

const isConfiguredValue = (value: string | undefined): value is string => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return false;
  }

  return !PLACEHOLDER_PATTERN.test(trimmed);
};

export const createOptionalMinioClient = (configService: ConfigService): Minio.Client | null => {
  const endPoint = configService.get<string>('MINIO_ENDPOINT');
  const accessKey = configService.get<string>('MINIO_ACCESS_KEY');
  const secretKey = configService.get<string>('MINIO_SECRET_KEY');
  const bucket = configService.get<string>('MINIO_BUCKET');
  const portRaw = configService.get<string>('MINIO_PORT');

  if (
    !isConfiguredValue(endPoint) ||
    !isConfiguredValue(accessKey) ||
    !isConfiguredValue(secretKey) ||
    !isConfiguredValue(bucket)
  ) {
    logger.warn('MinIO is not configured — asset uploads and presigned URLs are disabled');

    return null;
  }

  const port = Number(portRaw ?? 9000);

  if (!Number.isInteger(port) || port <= 0) {
    logger.warn(`MinIO is misconfigured (MINIO_PORT=${portRaw ?? ''}) — object storage disabled`);

    return null;
  }

  try {
    return new Minio.Client({
      endPoint: endPoint.trim(),
      port,
      accessKey: accessKey.trim(),
      secretKey: secretKey.trim(),
      useSSL: configService.get('MINIO_USE_SSL') === 'true',
    });
  } catch (error) {
    logger.warn(
      'MinIO client could not be created — object storage disabled',
      error instanceof Error ? error.message : String(error),
    );

    return null;
  }
};

export const readOptionalMinioBucket = (configService: ConfigService): string | null => {
  const bucket = configService.get<string>('MINIO_BUCKET')?.trim();

  if (!bucket || PLACEHOLDER_PATTERN.test(bucket)) {
    return null;
  }

  return bucket;
};
