import React from 'react';
import { NextResponse } from 'next/server';
import { CardSvg } from '../../../../components/CardSvg';
import { Locale, detectLocale, getLocaleMessages, isLocale } from '../../../../i18n';
import { decodeShareConfig } from '../../../../services/shareImageService';
import { CardConfig, RepoData, createDefaultCardConfig } from '../../../../types';

const GITHUB_API_ENDPOINT = 'https://api.github.com';
const DEFAULT_CACHE_SECONDS = 3600;
const MIN_CACHE_SECONDS = 60;
const MAX_CACHE_SECONDS = 86400;
const MAX_IMAGE_FETCH_BYTES = 2 * 1024 * 1024;
const IMAGE_FETCH_TIMEOUT_MS = 7000;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const parseCacheSeconds = (value: string | null) => {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed)) return DEFAULT_CACHE_SECONDS;
  return clamp(parsed, MIN_CACHE_SECONDS, MAX_CACHE_SECONDS);
};

const parseBooleanParam = (value: string | null, fallback: boolean) => {
  if (value === '1') return true;
  if (value === '0') return false;
  return fallback;
};

const toDataUrl = (buffer: ArrayBuffer, contentType: string) =>
  `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`;

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const buildErrorSvg = (title: string, detail: string) => `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="error-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#111827" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#error-bg)" />
  <text x="80" y="184" fill="#f8fafc" font-family="Inter, Arial, sans-serif" font-size="54" font-weight="700">
    Repo Cardify Render Error
  </text>
  <text x="80" y="264" fill="#e2e8f0" font-family="Inter, Arial, sans-serif" font-size="34" font-weight="600">
    ${escapeXml(title)}
  </text>
  <foreignObject x="80" y="306" width="1040" height="240">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, Arial, sans-serif; color: #94a3b8; font-size: 28px; line-height: 1.45;">
      ${escapeXml(detail)}
    </div>
  </foreignObject>
</svg>
`.trim();

const buildImageResponse = (svg: string, cacheSeconds: number, status = 200) =>
  new NextResponse(svg, {
    status,
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': `public, immutable, no-transform, max-age=0, s-maxage=${cacheSeconds}`,
      'content-disposition': 'inline; filename="repo-cardify.svg"',
    },
  });

const resolveLocale = (req: Request, rawLocale: string | null): Locale => {
  if (rawLocale && isLocale(rawLocale)) {
    return rawLocale;
  }
  const acceptLanguage = req.headers.get('accept-language') ?? 'en';
  return detectLocale(acceptLanguage);
};

const isAllowedRemoteImageHost = (hostname: string) =>
  hostname === 'github.com' ||
  hostname === 'avatars.githubusercontent.com' ||
  hostname.endsWith('.githubusercontent.com');

const resolveImageUrl = (source: string, origin: string): URL | null => {
  try {
    if (source.startsWith('/')) {
      return new URL(source, origin);
    }
    return new URL(source);
  } catch {
    return null;
  }
};

const isAllowedAvatarSource = (url: URL, origin: string) =>
  (url.protocol === 'https:' && isAllowedRemoteImageHost(url.hostname)) || url.origin === origin;

const isAllowedCustomLogoSource = (url: URL, origin: string) => {
  if (url.origin === origin && url.pathname.startsWith('/api/logo/')) {
    return true;
  }
  return url.protocol === 'https:' && isAllowedRemoteImageHost(url.hostname);
};

const fetchImageAsDataUrl = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        Accept: 'image/*',
      },
      signal: AbortSignal.timeout(IMAGE_FETCH_TIMEOUT_MS),
    });

    if (!response.ok) return null;

    const contentType = (response.headers.get('content-type') ?? '').split(';')[0].toLowerCase();
    if (!contentType.startsWith('image/')) return null;

    const contentLength = Number(response.headers.get('content-length') ?? NaN);
    if (Number.isFinite(contentLength) && contentLength > MAX_IMAGE_FETCH_BYTES) return null;

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_IMAGE_FETCH_BYTES) return null;

    return toDataUrl(buffer, contentType);
  } catch {
    return null;
  }
};

const resolveAvatarDataUrl = async (avatarUrl: string, origin: string): Promise<string | null> => {
  if (avatarUrl.startsWith('data:image/')) return avatarUrl;
  const parsedUrl = resolveImageUrl(avatarUrl, origin);
  if (!parsedUrl || !isAllowedAvatarSource(parsedUrl, origin)) return null;
  return fetchImageAsDataUrl(parsedUrl.toString());
};

const resolveCustomLogoDataUrl = async (
  customLogo: string | null,
  origin: string
): Promise<string | null> => {
  if (!customLogo) return null;
  if (customLogo.startsWith('data:image/')) return customLogo;

  const parsedUrl = resolveImageUrl(customLogo, origin);
  if (!parsedUrl || !isAllowedCustomLogoSource(parsedUrl, origin)) return null;
  return fetchImageAsDataUrl(parsedUrl.toString());
};

const applyThemeQuery = (config: CardConfig, themeRaw: string | null): CardConfig => {
  if (!themeRaw) return config;

  const normalizedTheme = themeRaw.trim().toLowerCase();
  if (normalizedTheme === 'light') {
    return {
      ...config,
      theme: 'simple',
      colors: {
        ...config.colors,
        background: '#ffffff',
        accent: '#18181b',
      },
    };
  }
  if (normalizedTheme === 'dark') {
    return {
      ...config,
      theme: 'dark',
    };
  }
  if (normalizedTheme === 'solid') {
    return {
      ...config,
      theme: 'solid',
    };
  }
  if (normalizedTheme === 'gradient') {
    return {
      ...config,
      theme: 'gradient',
    };
  }

  return config;
};

const applySocialifyQueryOverrides = (
  baseConfig: CardConfig,
  baseRepoData: RepoData,
  searchParams: URLSearchParams
): { config: CardConfig; repoData: RepoData } => {
  const showLanguage = parseBooleanParam(searchParams.get('language'), baseConfig.badge.visible);
  const showOwner = parseBooleanParam(searchParams.get('owner'), baseConfig.text.showOwner);
  const showStars = parseBooleanParam(searchParams.get('stargazers'), baseConfig.stats.showStars);
  const showForks = parseBooleanParam(searchParams.get('forks'), baseConfig.stats.showForks);
  const showIssues = parseBooleanParam(searchParams.get('issues'), baseConfig.stats.showIssues);
  const showName = parseBooleanParam(searchParams.get('name'), true);
  const showDescription = parseBooleanParam(searchParams.get('description'), true);

  let config: CardConfig = {
    ...baseConfig,
    badge: {
      ...baseConfig.badge,
      visible: showLanguage,
    },
    text: {
      ...baseConfig.text,
      showOwner,
      customTitle: showName ? baseConfig.text.customTitle : '',
      customDescription: showDescription ? baseConfig.text.customDescription : '',
    },
    stats: {
      ...baseConfig.stats,
      showStars,
      showForks,
      showIssues,
    },
  };

  config = applyThemeQuery(config, searchParams.get('theme'));

  const repoData: RepoData = {
    ...baseRepoData,
    name: showName ? baseRepoData.name : '',
    description: showDescription ? baseRepoData.description : '',
  };

  return { config, repoData };
};

const mapGitHubError = (status: number, bodyText: string) => {
  if (status === 404) return 'Repository not found.';
  if (status === 401) return 'GitHub token is invalid or missing.';
  if (status === 403) {
    if (bodyText.toLowerCase().includes('rate limit')) {
      return 'GitHub API rate limit exceeded. Configure GITHUB_TOKEN on the server.';
    }
    return 'Access to this repository is forbidden.';
  }
  return 'Failed to fetch repository from GitHub.';
};

const getGitHubHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
};

const fetchRepoData = async (owner: string, name: string): Promise<RepoData> => {
  const headers = getGitHubHeaders();
  const repoResponse = await fetch(`${GITHUB_API_ENDPOINT}/repos/${owner}/${name}`, {
    headers,
    cache: 'no-store',
  });

  if (!repoResponse.ok) {
    const bodyText = await repoResponse.text();
    throw new Error(mapGitHubError(repoResponse.status, bodyText));
  }

  const repoData = await repoResponse.json();
  let languages: string[] = [];

  try {
    const languageResponse = await fetch(repoData.languages_url, {
      headers,
      cache: 'no-store',
    });
    if (languageResponse.ok) {
      const languageData = await languageResponse.json();
      languages = Object.keys(languageData).slice(0, 3);
    }
  } catch {
    languages = [];
  }

  return {
    owner: repoData.owner?.login ?? owner,
    name: repoData.name ?? name,
    description: repoData.description,
    stars: repoData.stargazers_count ?? 0,
    forks: repoData.forks_count ?? 0,
    issues: repoData.open_issues_count ?? 0,
    language: repoData.language ?? null,
    languages,
    avatarUrl: repoData.owner?.avatar_url ?? '',
  };
};

interface RouteContext {
  params: Promise<{ owner: string; name: string }> | { owner: string; name: string };
}

export async function GET(req: Request, context: RouteContext) {
  const params = await Promise.resolve(context.params);
  const owner = decodeURIComponent(params.owner ?? '').trim();
  const name = decodeURIComponent(params.name ?? '').trim();

  if (!owner || !name) {
    return buildImageResponse(
      buildErrorSvg('Invalid repository path', 'Use /{owner}/{repo}/image to generate a repository card.'),
      MIN_CACHE_SECONDS,
      400
    );
  }

  const { searchParams } = new URL(req.url);
  const locale = resolveLocale(req, searchParams.get('l'));
  const cacheSeconds = parseCacheSeconds(searchParams.get('cache'));
  const baseConfig = decodeShareConfig(searchParams.get('c')) ?? createDefaultCardConfig();

  try {
    const baseRepoData = await fetchRepoData(owner, name);
    const { config, repoData } = applySocialifyQueryOverrides(baseConfig, baseRepoData, searchParams);
    const origin = new URL(req.url).origin;
    const [avatarDataUrl, customLogoDataUrl] = await Promise.all([
      resolveAvatarDataUrl(repoData.avatarUrl, origin),
      resolveCustomLogoDataUrl(config.customLogo, origin),
    ]);
    const hydratedRepoData = avatarDataUrl ? { ...repoData, avatarUrl: avatarDataUrl } : repoData;
    const hydratedConfig = { ...config, customLogo: customLogoDataUrl ?? null };
    const messages = getLocaleMessages(locale);
    const { renderToStaticMarkup } = await import('react-dom/server');
    const svg = renderToStaticMarkup(
      React.createElement(CardSvg, {
        data: hydratedRepoData,
        config: hydratedConfig,
        labels: messages.card,
        noDescriptionText: messages.app.noDescription,
      })
    );

    return buildImageResponse(svg, cacheSeconds);
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Unknown error.';
    const errorSvg = buildErrorSvg(`${owner}/${name}`, detail);
    return buildImageResponse(errorSvg, MIN_CACHE_SECONDS);
  }
}
