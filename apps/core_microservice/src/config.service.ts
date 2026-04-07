import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

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
