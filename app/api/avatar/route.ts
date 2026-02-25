import { NextResponse } from 'next/server';

const FALLBACK_SIZE = 256;
const FALLBACK_BG = '#1f2937';
const FALLBACK_TEXT = '#f9fafb';
const MAX_OWNER_LENGTH = 64;

const trimOwner = (owner: string) => owner.trim().slice(0, MAX_OWNER_LENGTH);

const encodeSvgDataUrl = (svg: string) =>
  `data:image/svg+xml;base64,${Buffer.from(svg, 'utf-8').toString('base64')}`;

const isAllowedAvatarHost = (hostname: string) =>
  hostname === 'github.com' ||
  hostname === 'avatars.githubusercontent.com' ||
  hostname.endsWith('.githubusercontent.com');

const buildFallbackSvg = (ownerRaw: string) => {
  const owner = trimOwner(ownerRaw);
  const firstChar = owner[0]?.toUpperCase() ?? '?';
  const safeChar = firstChar.replace(/[<>&'"]/g, '');

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${FALLBACK_SIZE}" height="${FALLBACK_SIZE}" viewBox="0 0 ${FALLBACK_SIZE} ${FALLBACK_SIZE}">`,
    `<rect width="${FALLBACK_SIZE}" height="${FALLBACK_SIZE}" fill="${FALLBACK_BG}" />`,
    '<circle cx="128" cy="106" r="48" fill="#374151" />',
    '<path d="M32 236c0-51 42-92 96-92s96 41 96 92" fill="#374151" />',
    `<text x="128" y="216" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="74" fill="${FALLBACK_TEXT}" font-weight="700">${safeChar}</text>`,
    '</svg>',
  ].join('');
};

const fallbackResponse = (owner: string) => {
  const svg = buildFallbackSvg(owner);
  return NextResponse.json(
    {
      dataUrl: encodeSvgDataUrl(svg),
      fallback: true,
    },
    { status: 200 }
  );
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawUrl = searchParams.get('url')?.trim();
  const owner = searchParams.get('owner')?.trim() ?? '';

  if (!rawUrl) {
    return fallbackResponse(owner);
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return fallbackResponse(owner);
  }

  if (parsedUrl.protocol !== 'https:' || !isAllowedAvatarHost(parsedUrl.hostname)) {
    return fallbackResponse(owner);
  }

  try {
    const response = await fetch(parsedUrl.toString(), {
      cache: 'no-store',
      headers: {
        Accept: 'image/*',
      },
    });

    if (!response.ok) {
      return fallbackResponse(owner);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.startsWith('image/')) {
      return fallbackResponse(owner);
    }

    const buffer = await response.arrayBuffer();
    const dataUrl = `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`;

    return NextResponse.json(
      {
        dataUrl,
        fallback: false,
      },
      { status: 200 }
    );
  } catch {
    return fallbackResponse(owner);
  }
}
