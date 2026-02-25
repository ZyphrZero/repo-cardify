import { NextResponse } from 'next/server';
import { readStoredLogo } from '../../../../services/logoStorageService';

export const runtime = 'nodejs';

interface RouteContext {
  params: Promise<{ logoId: string }> | { logoId: string };
}

const SVG_SECURITY_HEADERS = {
  'content-security-policy': "default-src 'none'; img-src 'self' data:; style-src 'none'; sandbox;",
  'x-content-type-options': 'nosniff',
};

export async function GET(_req: Request, context: RouteContext) {
  const params = await Promise.resolve(context.params);
  const logoId = decodeURIComponent(params.logoId ?? '').trim();
  const logo = await readStoredLogo(logoId);

  if (!logo) {
    return NextResponse.json({ message: 'Logo not found.' }, { status: 404 });
  }

  const responseBody = new Uint8Array(logo.buffer);

  return new NextResponse(responseBody, {
    status: 200,
    headers: {
      'content-type': logo.mimeType,
      'cache-control': 'public, immutable, max-age=31536000, s-maxage=31536000',
      'content-disposition': `inline; filename="${logoId}"`,
      ...(logo.mimeType === 'image/svg+xml' ? SVG_SECURITY_HEADERS : {}),
    },
  });
}
