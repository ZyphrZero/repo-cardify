import { FontId } from '../types';

type FontMeta = {
  family: string;
  slug: string;
  weights: number[];
  fallback: 'sans-serif' | 'serif' | 'monospace';
};

const EXPORT_FONT_FAMILY = '__repo_cardify_export_font';

const FONT_META_MAP: Record<FontId, FontMeta> = {
  inter: {
    family: 'Inter',
    slug: 'inter',
    weights: [400, 500, 600, 700, 800],
    fallback: 'sans-serif',
  },
  mono: {
    family: 'JetBrains Mono',
    slug: 'jetbrains-mono',
    weights: [400, 700],
    fallback: 'monospace',
  },
  serif: {
    family: 'Merriweather',
    slug: 'merriweather',
    weights: [400, 700],
    fallback: 'serif',
  },
  poppins: {
    family: 'Poppins',
    slug: 'poppins',
    weights: [400, 600, 800],
    fallback: 'sans-serif',
  },
  playfair: {
    family: 'Playfair Display',
    slug: 'playfair-display',
    weights: [600, 800],
    fallback: 'serif',
  },
  oswald: {
    family: 'Oswald',
    slug: 'oswald',
    weights: [500, 700],
    fallback: 'sans-serif',
  },
};

const fontCssCache = new Map<FontId, Promise<string>>();

const toBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;
  let binary = '';

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
};

const fetchFontFace = async (slug: string, weight: number): Promise<string> => {
  try {
    const url = `https://unpkg.com/@fontsource/${slug}/files/${slug}-latin-${weight}-normal.woff`;
    const response = await fetch(url);
    if (!response.ok) return '';

    const data = await response.arrayBuffer();
    const base64 = toBase64(data);
    return [
      '@font-face {',
      `font-family: '${EXPORT_FONT_FAMILY}';`,
      `src: url('data:font/woff;base64,${base64}') format('woff');`,
      `font-weight: ${weight};`,
      'font-style: normal;',
      'font-display: block;',
      '}',
    ].join('');
  } catch {
    return '';
  }
};

export const getPreviewFontFamily = (fontId: FontId): string => {
  const meta = FONT_META_MAP[fontId];
  return `'${meta.family}', ${meta.fallback}`;
};

export const buildEmbeddedFontCss = async (fontId: FontId): Promise<string> => {
  if (fontCssCache.has(fontId)) {
    return fontCssCache.get(fontId)!;
  }

  const meta = FONT_META_MAP[fontId];
  const request = Promise.all(meta.weights.map((weight) => fetchFontFace(meta.slug, weight))).then((css) =>
    css.filter(Boolean).join('\n')
  );

  fontCssCache.set(fontId, request);
  return request;
};

export const normalizeSvgFontFaces = (source: string): string => {
  const withoutGoogleImport = source.replace(
    /<style[^>]*>[\s\S]*?fonts\.googleapis\.com[\s\S]*?<\/style>/gi,
    ''
  );

  let replaced = withoutGoogleImport;
  Object.values(FONT_META_MAP).forEach((meta) => {
    const quotedSingle = new RegExp(`'${meta.family.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`, 'g');
    const quotedDouble = new RegExp(`"${meta.family.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
    replaced = replaced.replace(quotedSingle, `'${EXPORT_FONT_FAMILY}'`);
    replaced = replaced.replace(quotedDouble, `'${EXPORT_FONT_FAMILY}'`);
  });

  return replaced;
};

export const injectEmbeddedFontStyle = (source: string, css: string): string => {
  if (!css.trim()) return source;
  const style = `<style type="text/css"><![CDATA[\n${css}\n]]></style>`;

  if (source.includes('</defs>')) {
    return source.replace('</defs>', `${style}</defs>`);
  }

  return source.replace(/<svg[^>]*>/, (svgTag) => `${svgTag}<defs>${style}</defs>`);
};
