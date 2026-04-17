import { Injectable } from '@nestjs/common';
import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  type BinaryLike,
  type ScryptOptions,
} from 'crypto';

import {
  PASSWORD_HASH_ALGORITHM,
  PASSWORD_HASH_VERSION,
  PASSWORD_KEY_LENGTH,
  PASSWORD_SALT_LENGTH,
  PASSWORD_SCRYPT_PARAMS,
} from '../common/constants';
import { ParsedPasswordHash } from '../common/types/password';

@Injectable()
export class PasswordService {
  private readonly scryptOptions: ScryptOptions = { ...PASSWORD_SCRYPT_PARAMS };

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(PASSWORD_SALT_LENGTH).toString('hex');
    const hash = await this.deriveKey(password, salt, PASSWORD_KEY_LENGTH, this.scryptOptions);

    return this.formatHash(salt, hash);
  }

  async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    const parsedHash = this.parsePasswordHash(passwordHash);

    if (!parsedHash || parsedHash.algorithm !== PASSWORD_HASH_ALGORITHM) {
      return false;
    }

    const derivedKey = await this.deriveKey(
      password,
      parsedHash.salt,
      parsedHash.keyLength,
      parsedHash.scryptOptions,
    );
    const storedHash = Buffer.from(parsedHash.hash, 'hex');

    if (storedHash.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(storedHash, derivedKey);
  }

  private formatHash(salt: string, hash: Buffer): string {
    return [
      PASSWORD_HASH_ALGORITHM,
      String(PASSWORD_HASH_VERSION),
      String(PASSWORD_SCRYPT_PARAMS.N),
      String(PASSWORD_SCRYPT_PARAMS.r),
      String(PASSWORD_SCRYPT_PARAMS.p),
      String(PASSWORD_KEY_LENGTH),
      salt,
      hash.toString('hex'),
    ].join('$');
  }

  private parsePasswordHash(passwordHash: string): ParsedPasswordHash | null {
    return this.parseVersionedHash(passwordHash);
  }

  private parseVersionedHash(passwordHash: string): ParsedPasswordHash | null {
    const [algorithm, versionValue, nValue, rValue, pValue, keyLengthValue, salt, hash, ...rest] =
      passwordHash.split('$');

    if (rest.length > 0) {
      return null;
    }

    const version = this.toPositiveInt(versionValue);
    const N = this.toPositiveInt(nValue);
    const r = this.toPositiveInt(rValue);
    const p = this.toPositiveInt(pValue);
    const keyLength = this.toPositiveInt(keyLengthValue);

    if (
      !algorithm ||
      !version ||
      !N ||
      !r ||
      !p ||
      !keyLength ||
      !this.isHex(salt) ||
      !this.isHex(hash) ||
      hash.length !== keyLength * 2
    ) {
      return null;
    }

    return {
      algorithm,
      version,
      salt,
      hash,
      keyLength,
      scryptOptions: { N, r, p },
    };
  }

  private isHex(value: string): boolean {
    return value.length > 0 && value.length % 2 === 0 && /^[\da-f]+$/i.test(value);
  }

  private toPositiveInt(value: string | undefined): number | null {
    if (!value) {
      return null;
    }

    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
      return null;
    }

    return parsedValue;
  }

  private async deriveKey(
    password: BinaryLike,
    salt: BinaryLike,
    keyLength: number,
    options: ScryptOptions,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      scryptCallback(password, salt, keyLength, options, (error, derivedKey) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(derivedKey);
      });
    });
  }
}
