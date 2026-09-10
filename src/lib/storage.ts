import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface UploadResult {
  filename: string;
  originalName: string;
  storageLocation: string;
  mimeType: string;
  fileSize: number;
}

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export function ensureUploadDirExists() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export async function saveUploadedFile(file: File): Promise<UploadResult> {
  ensureUploadDirExists();

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = path.extname(file.name) || '.jpg';
  const uniqueId = crypto.randomBytes(8).toString('hex');
  const filename = `photo_${Date.now()}_${uniqueId}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  fs.writeFileSync(filePath, buffer);

  const storageLocation = `/uploads/${filename}`;

  return {
    filename,
    originalName: file.name,
    storageLocation,
    mimeType: file.type || 'image/jpeg',
    fileSize: buffer.length,
  };
}

export function deleteFile(storageLocation: string): void {
  try {
    const filename = path.basename(storageLocation);
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Failed to delete file', err);
  }
}
