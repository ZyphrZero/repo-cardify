import { NextResponse } from 'next/server';
import {
  MAX_LOGO_UPLOAD_BYTES,
  normalizeUploadedLogo,
  persistLogo,
} from '../../../services/logoStorageService';

export const runtime = 'nodejs';

const buildError = (status: number, message: string) =>
  NextResponse.json(
    {
      message,
    },
    { status }
  );

export async function POST(req: Request) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return buildError(400, 'Invalid upload request.');
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return buildError(400, 'Missing "file" in multipart form data.');
  }

  try {
    const normalized = await normalizeUploadedLogo(file);
    const stored = await persistLogo(normalized.buffer, normalized.mimeType);
    return NextResponse.json(stored, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to store logo.';
    if (message.includes('too large')) {
      return buildError(413, message);
    }
    if (message.includes('Unsupported') || message.includes('Invalid')) {
      return buildError(415, message);
    }
    return buildError(400, message || `Failed to upload logo. Max size: ${MAX_LOGO_UPLOAD_BYTES} bytes.`);
  }
}

