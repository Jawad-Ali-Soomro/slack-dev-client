import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';

export const UPLOADS_ROOT = join(process.cwd(), 'uploads');

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

function ensureUploadDir(subdir: string) {
  const dir = join(UPLOADS_ROOT, subdir);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function createImageUploadOptions(subdir: string, maxSizeMb = 5) {
  const destination = ensureUploadDir(subdir);

  return {
    storage: diskStorage({
      destination,
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase() || '.bin';
        cb(null, `${randomUUID()}${ext}`);
      },
    }),
    limits: {
      fileSize: maxSizeMb * 1024 * 1024,
    },
    fileFilter: (
      _req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        cb(
          new BadRequestException(
            'Only JPEG, PNG, WebP, and GIF images are allowed',
          ),
          false,
        );
        return;
      }
      cb(null, true);
    },
  };
}

export const avatarUploadOptions = createImageUploadOptions('avatars');
export const logoUploadOptions = createImageUploadOptions('logos');
export const productUploadOptions = createImageUploadOptions('products', 10);
