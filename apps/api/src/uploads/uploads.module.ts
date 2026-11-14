import {
  BadRequestException,
  Controller,
  Injectable,
  Module,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Auth } from '../auth/auth.guard.js';
import { env } from '../config/env.js';
import { toPublicUrl } from '../common/utils.js';
import { RateLimit } from '../common/rate-limit.guard.js';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

interface UploadedImage {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/** Nhận diện định dạng qua "magic bytes" của file, không tin phần mở rộng hay mimetype do client gửi. */
function detectImageType(buffer: Buffer): 'jpg' | 'png' | 'webp' | 'gif' | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  if (buffer.toString('ascii', 0, 4) === 'GIF8') return 'gif';
  return null;
}

@Injectable()
export class UploadsService {
  /** Lưu ảnh vào UPLOAD_DIR/yyyy/mm/<ngẫu nhiên>.<ext>, trả về đường dẫn lưu DB và URL công khai. */
  async saveImage(file: UploadedImage | undefined) {
    if (!file) throw new BadRequestException('Chưa chọn file ảnh.');
    if (file.size > MAX_UPLOAD_BYTES) throw new BadRequestException('Ảnh vượt quá dung lượng tối đa 5MB.');

    const ext = detectImageType(file.buffer);
    if (!ext) throw new BadRequestException('Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF.');

    const now = new Date();
    const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
    const fileName = `${randomBytes(12).toString('hex')}.${ext}`;
    await mkdir(join(env.uploadDir, folder), { recursive: true });
    await writeFile(join(env.uploadDir, folder, fileName), file.buffer);

    const path = `/uploads/${folder}/${fileName}`;
    return { path, url: toPublicUrl(path) };
  }
}

@Controller('admin/uploads')
@Auth()
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @RateLimit(60, 60)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 } }))
  upload(@UploadedFile() file: UploadedImage | undefined) {
    return this.uploadsService.saveImage(file);
  }
}

@Module({
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
