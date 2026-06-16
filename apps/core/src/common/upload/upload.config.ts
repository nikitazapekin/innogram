import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { diskStorage } from 'multer';

export const DEFAULT_UPLOAD_FILE_SIZE_LIMIT = 10 * 1024 * 1024;

export const CHAT_UPLOADS_DIR = path.resolve('uploads');

export const TEMP_UPLOAD_DIR = path.join(os.tmpdir(), 'innogram-uploads');

export const sanitizeUploadFileName = (originalName: string): string =>
  originalName.replace(/[^a-zA-Z0-9._-]/g, '_');

const ensureUploadDir = (directory: string): void => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

export const createTempDiskStorage = () => {
  ensureUploadDir(TEMP_UPLOAD_DIR);

  return diskStorage({
    destination: (_request, _file, callback) => {
      callback(null, TEMP_UPLOAD_DIR);
    },
    filename: (_request, file, callback) => {
      callback(null, `${randomUUID()}-${sanitizeUploadFileName(file.originalname)}`);
    },
  });
};

export const createChatDiskStorage = () => {
  ensureUploadDir(CHAT_UPLOADS_DIR);

  return diskStorage({
    destination: (_request, _file, callback) => {
      callback(null, CHAT_UPLOADS_DIR);
    },
    filename: (_request, file, callback) => {
      callback(null, `${Date.now()}-${sanitizeUploadFileName(file.originalname)}`);
    },
  });
};
