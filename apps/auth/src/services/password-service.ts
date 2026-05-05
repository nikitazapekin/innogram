import * as bcrypt from 'bcrypt';
import type { AppConfig } from '../config/app-config';

export const hashPassword = (password: string, config: AppConfig): Promise<string> =>
  bcrypt.hash(password, config.passwordSaltRounds);
