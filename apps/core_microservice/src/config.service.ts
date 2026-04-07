import { Injectable } from '@nestjs/common';
import { resolve } from 'node:path';
import { loadEnvFile } from 'node:process';

loadEnvFile(resolve(__dirname, '../../../.env'));

@Injectable()
export class ConfigService {
  getOrThrow(key: string): string {
    const value = process.env[key];

    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }

    return value;
  }
}
