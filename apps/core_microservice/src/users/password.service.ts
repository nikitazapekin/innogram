import { Injectable } from '@nestjs/common';
import { randomBytes, scrypt as scryptCallback } from 'crypto';

const PASSWORD_SALT_LENGTH = 16;
const PASSWORD_DERIVED_KEY_LENGTH = 64;
const PASSWORD_HASH_SEPARATOR = ':';

@Injectable()
export class PasswordService {
  private scrypt(password: string, salt: string, keyLength: number): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      scryptCallback(password, salt, keyLength, (error, derivedKey) => {
        if (error) {
          reject(error);

          return;
        }

        resolve(derivedKey);
      });
    });
  }

  private serializePasswordHash(salt: string, derivedKey: Buffer): string {
    const encodedDerivedKey = derivedKey.toString('hex');

    return [salt, encodedDerivedKey].join(PASSWORD_HASH_SEPARATOR);
  }

  async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(PASSWORD_SALT_LENGTH).toString('hex');
    const derivedKey = await this.scrypt(password, salt, PASSWORD_DERIVED_KEY_LENGTH);

    return this.serializePasswordHash(salt, derivedKey);
  }
}
