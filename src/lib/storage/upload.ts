import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? './uploads';
const MAX_SIZE   = parseInt(process.env.MAX_FILE_SIZE_MB ?? '15') * 1024 * 1024;

['cv', 'offers', 'signed'].forEach((dir) => {
  fs.mkdirSync(path.join(UPLOAD_DIR, dir), { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const subdir = ((req as unknown) as Record<string, unknown>).uploadSubdir as string ?? 'cv';
    cb(null, path.join(UPLOAD_DIR, subdir));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${nanoid(16)}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});
