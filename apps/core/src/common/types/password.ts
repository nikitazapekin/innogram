import { ScryptOptions } from 'crypto';

export type ParsedPasswordHash = {
  algorithm: string;
  version: number;
  salt: string;
  hash: string;
  keyLength: number;
  scryptOptions: ScryptOptions;
};
