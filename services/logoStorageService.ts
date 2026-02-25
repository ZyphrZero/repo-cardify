import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const LOGO_STORAGE_DIR = process.env.LOGO_STORAGE_DIR?.trim()
  ? path.resolve(process.env.LOGO_STORAGE_DIR)
  : path.join(process.cwd(), '.repo-cardify', 'logos');

const LOGO_ID_REGEX = /^[a-f0-9]{64}\.(png|jpg|webp|svg)$/;

const MIME_EXTENSION_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
} as const;

const EXTENSION_MIME_MAP: Record<string, LogoMimeType> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
};

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47] as const;
const JPG_SIGNATURE = [0xff, 0xd8, 0xff] as const;
const WEBP_SIGNATURE = [0x52, 0x49, 0x46, 0x46] as const;
const WEBP_HEADER = 'WEBP';

export const MAX_LOGO_UPLOAD_BYTES = 300 * 1024;
export type LogoMimeType = keyof typeof MIME_EXTENSION_MAP;

interface StoredLogoRecord {
  logoId: string;
  url: string;
  mimeType: LogoMimeType;
  byteLength: number;
}

interface StoredLogoFile {
  mimeType: LogoMimeType;
  buffer: Buffer;
}

const hasSignature = (bytes: Uint8Array, signature: readonly number[]) =>
  bytes.length >= signature.length &&
  signature.every((value, index) => bytes[index] === value);

const detectLogoMimeType = (bytes: Uint8Array): LogoMimeType | null => {
  if (hasSignature(bytes, PNG_SIGNATURE)) return 'image/png';
  if (hasSignature(bytes, JPG_SIGNATURE)) return 'image/jpeg';

  if (hasSignature(bytes, WEBP_SIGNATURE) && bytes.length >= 12) {
    const marker = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    if (marker === WEBP_HEADER) return 'image/webp';
  }

  const textHead = Buffer.from(bytes.subarray(0, 512)).toString('utf-8').trimStart().toLowerCase();
  if (textHead.startsWith('<?xml') || textHead.startsWith('<svg')) return 'image/svg+xml';

  return null;
};

const sanitizeSvg = (raw: string) => {
  let value = raw;
  value = value.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  value = value.replace(/<foreignObject[\s\S]*?>[\s\S]*?<\/foreignObject>/gi, '');
  value = value.replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '');
  value = value.replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '');
  value = value.replace(/javascript:/gi, '');
  return value.trim();
};

const inferLogoMimeType = (fileType: string, bytes: Uint8Array): LogoMimeType | null => {
  const detected = detectLogoMimeType(bytes);
  if (detected) return detected;

  const normalized = fileType.trim().toLowerCase();
  if (normalized in MIME_EXTENSION_MAP) {
    return normalized as LogoMimeType;
  }

  return null;
};

export const normalizeUploadedLogo = async (file: File): Promise<{ mimeType: LogoMimeType; buffer: Buffer }> => {
  const binary = await file.arrayBuffer();
  const rawBytes = new Uint8Array(binary);

  if (rawBytes.byteLength <= 0) {
    throw new Error('Uploaded logo is empty.');
  }

  if (rawBytes.byteLength > MAX_LOGO_UPLOAD_BYTES) {
    throw new Error(`Logo file is too large. Max allowed size is ${MAX_LOGO_UPLOAD_BYTES} bytes.`);
  }

  const mimeType = inferLogoMimeType(file.type, rawBytes);
  if (!mimeType) {
    throw new Error('Unsupported logo format. Use PNG, JPG, WEBP, or SVG.');
  }

  if (mimeType !== 'image/svg+xml') {
    return {
      mimeType,
      buffer: Buffer.from(rawBytes),
    };
  }

  const svgText = Buffer.from(rawBytes).toString('utf-8');
  const sanitizedSvg = sanitizeSvg(svgText);
  if (!sanitizedSvg || !/<svg[\s>]/i.test(sanitizedSvg)) {
    throw new Error('Invalid SVG logo content.');
  }

  const svgBuffer = Buffer.from(sanitizedSvg, 'utf-8');
  if (svgBuffer.byteLength > MAX_LOGO_UPLOAD_BYTES) {
    throw new Error(`Logo file is too large. Max allowed size is ${MAX_LOGO_UPLOAD_BYTES} bytes.`);
  }

  return {
    mimeType,
    buffer: svgBuffer,
  };
};

export const persistLogo = async (buffer: Buffer, mimeType: LogoMimeType): Promise<StoredLogoRecord> => {
  const digest = createHash('sha256').update(buffer).digest('hex');
  const extension = MIME_EXTENSION_MAP[mimeType];
  const logoId = `${digest}.${extension}`;
  const targetPath = path.join(LOGO_STORAGE_DIR, logoId);

  await mkdir(LOGO_STORAGE_DIR, { recursive: true });
  try {
    await writeFile(targetPath, buffer, { flag: 'wx' });
  } catch (error: any) {
    if (error?.code !== 'EEXIST') {
      throw error;
    }
  }

  return {
    logoId,
    url: `/api/logo/${logoId}`,
    mimeType,
    byteLength: buffer.byteLength,
  };
};

const getMimeTypeFromLogoId = (logoId: string): LogoMimeType | null => {
  const extension = logoId.split('.').pop()?.toLowerCase();
  if (!extension) return null;
  return EXTENSION_MIME_MAP[extension] ?? null;
};

export const isValidLogoId = (logoId: string) => LOGO_ID_REGEX.test(logoId);

export const readStoredLogo = async (logoId: string): Promise<StoredLogoFile | null> => {
  if (!isValidLogoId(logoId)) {
    return null;
  }

  const mimeType = getMimeTypeFromLogoId(logoId);
  if (!mimeType) return null;

  try {
    const buffer = await readFile(path.join(LOGO_STORAGE_DIR, logoId));
    return { mimeType, buffer };
  } catch (error: any) {
    if (error?.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
};

