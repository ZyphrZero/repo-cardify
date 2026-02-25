import React, { forwardRef } from 'react';
import {
  brickWall,
  charlieBrown,
  circuitBoard,
  diagonalStripes,
  floatingCogs,
  formalInvitation,
  overlappingHexagons,
  plus,
  signal,
} from 'hero-patterns';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CardConfig,
  PatternId,
  RepoData,
  ThemeId,
} from '../types';
import { getPreviewFontFamily } from '../services/exportFontService';
import { useI18n } from './I18nContext';
import {
  estimateTextWidth,
  getBadgeOffsets,
  getBadgeWidth,
  getVisibleBadgeLanguages,
  getVisibleStats,
} from './cardMetrics';

interface CardPreviewProps {
  data: RepoData;
  config: CardConfig;
}

interface ThemeTokens {
  primaryText: string;
  secondaryText: string;
  cardBg: string;
  cardBorder: string;
  patternColor: string;
}

const SPLIT_STAT_VALUE_BG: Record<'stars' | 'forks' | 'issues', string> = {
  stars: '#c28d12',
  forks: '#2e9b47',
  issues: '#1a7fc5',
};

const SPLIT_STAT_VALUE_TEXT: Record<'stars' | 'forks' | 'issues', string> = {
  stars: '#ffffff',
  forks: '#ffffff',
  issues: '#ffffff',
};

const CARD_STAT_GLASS_TINT: Record<'stars' | 'forks' | 'issues', string> = {
  stars: '#fbbf24',
  forks: '#34d399',
  issues: '#60a5fa',
};

const LANGUAGE_DOT_COLORS: Record<string, string> = {
  typescript: '#3178c6',
  javascript: '#f1e05a',
  python: '#3572a5',
  java: '#b07219',
  'c++': '#f34b7d',
  c: '#555555',
  'c#': '#178600',
  go: '#00add8',
  rust: '#dea584',
  ruby: '#701516',
  php: '#4f5d95',
  swift: '#f05138',
  kotlin: '#a97bff',
  dart: '#00b4ab',
  scala: '#c22d40',
  shell: '#89e051',
  html: '#e34c26',
  css: '#563d7c',
  vue: '#41b883',
  svelte: '#ff3e00',
  'objective-c': '#438eff',
  'objective-c++': '#6866fb',
  'jupyter notebook': '#da5b0b',
  mdx: '#1b1f24',
  dockerfile: '#384d54',
  makefile: '#427819',
};

interface GlassStatProfile {
  baseTopOpacity: number;
  baseMidOpacity: number;
  baseBottomOpacity: number;
  glowOpacity: number;
  sheenOpacity: number;
  edgeTopOpacity: number;
  edgeBottomOpacity: number;
  shadowOpacity: number;
  liftOpacity: number;
}

const normalizeLanguageKey = (language: string) => language.trim().toLowerCase();

const getLanguageDotColor = (language: string, fallback: string) =>
  LANGUAGE_DOT_COLORS[normalizeLanguageKey(language)] ?? fallback;

const patternFunctions: Partial<Record<PatternId, (color: string, opacity: number) => string>> = {
  signal,
  'charlie-brown': charlieBrown,
  'formal-invitation': formalInvitation,
  plus,
  'circuit-board': circuitBoard,
  'overlapping-hexagons': overlappingHexagons,
  'brick-wall': brickWall,
  'floating-cogs': floatingCogs,
  'diagonal-stripes': diagonalStripes,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const COMPACT_NUMBER_UNITS = [
  { value: 1_000_000_000, suffix: 'b' },
  { value: 1_000_000, suffix: 'm' },
  { value: 1_000, suffix: 'k' },
] as const;

const formatCompactNumber = (value: number) => {
  const absValue = Math.abs(value);

  for (const unit of COMPACT_NUMBER_UNITS) {
    if (absValue >= unit.value) {
      const scaled = value / unit.value;
      return `${scaled.toFixed(1)}${unit.suffix}`;
    }
  }

  return `${value}`;
};

const formatStatValue = (value: number, format: CardConfig['stats']['valueFormat']) => {
  if (format === 'full') {
    return `${value}`;
  }
  return formatCompactNumber(value);
};

const appendEllipsis = (line: string, maxWidth: number, fontSize: number) => {
  let value = line.trimEnd();
  if (!value) return '...';
  while (value.length > 0 && estimateTextWidth(`${value}...`, fontSize) > maxWidth) {
    value = value.slice(0, -1);
  }
  return value ? `${value}...` : '...';
};

const buildDescriptionLines = (text: string, maxWidth: number, fontSize: number, maxLines: number): string[] => {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const lines: string[] = [];
  let current = '';
  const pushLine = (line: string) => {
    if (line) lines.push(line);
  };

  const rawTokens = normalized.includes(' ') ? normalized.split(' ') : Array.from(normalized);
  const useSpaces = normalized.includes(' ');

  for (const token of rawTokens) {
    const next = current ? `${current}${useSpaces ? ' ' : ''}${token}` : token;
    if (estimateTextWidth(next, fontSize) <= maxWidth) {
      current = next;
      continue;
    }

    if (current) {
      pushLine(current);
      current = token;
    } else {
      let chunk = '';
      for (const char of Array.from(token)) {
        const candidate = `${chunk}${char}`;
        if (estimateTextWidth(candidate, fontSize) <= maxWidth) {
          chunk = candidate;
        } else {
          pushLine(chunk);
          chunk = char;
        }

        if (lines.length >= maxLines) {
          lines[maxLines - 1] = appendEllipsis(lines[maxLines - 1], maxWidth, fontSize);
          return lines.slice(0, maxLines);
        }
      }
      current = chunk;
    }

    if (lines.length >= maxLines) {
      lines[maxLines - 1] = appendEllipsis(lines[maxLines - 1], maxWidth, fontSize);
      return lines.slice(0, maxLines);
    }
  }

  if (current) {
    pushLine(current);
  }

  if (lines.length > maxLines) {
    const trimmed = lines.slice(0, maxLines);
    trimmed[maxLines - 1] = appendEllipsis(trimmed[maxLines - 1], maxWidth, fontSize);
    return trimmed;
  }

  return lines;
};

const getContrastColor = (hex: string) => {
  const value = hex.replace('#', '');
  const safe = value.length === 3 ? value.split('').map((v) => `${v}${v}`).join('') : value;
  const r = Number.parseInt(safe.slice(0, 2), 16) || 0;
  const g = Number.parseInt(safe.slice(2, 4), 16) || 0;
  const b = Number.parseInt(safe.slice(4, 6), 16) || 0;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? '#18181b' : '#ffffff';
};

const getThemeTokens = (theme: ThemeId, background: string): ThemeTokens => {
  if (theme === 'simple') {
    return {
      primaryText: '#18181b',
      secondaryText: '#52525b',
      cardBg: 'rgba(0,0,0,0.04)',
      cardBorder: 'rgba(0,0,0,0.1)',
      patternColor: '#09090b',
    };
  }

  if (theme === 'solid') {
    const contrast = getContrastColor(background);
    const isLight = contrast === '#18181b';
    return {
      primaryText: contrast,
      secondaryText: isLight ? '#3f3f46' : '#e4e4e7',
      cardBg: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)',
      cardBorder: isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.24)',
      patternColor: isLight ? '#18181b' : '#f4f4f5',
    };
  }

  if (theme === 'dark') {
    return {
      primaryText: '#ffffff',
      secondaryText: '#a1a1aa',
      cardBg: 'rgba(255,255,255,0.06)',
      cardBorder: 'rgba(255,255,255,0.12)',
      patternColor: '#f4f4f5',
    };
  }

  return {
    primaryText: '#ffffff',
    secondaryText: '#e4e4e7',
    cardBg: 'rgba(255,255,255,0.1)',
    cardBorder: 'rgba(255,255,255,0.2)',
    patternColor: '#f8fafc',
  };
};

const getGlassStatProfile = (theme: ThemeId, background: string): GlassStatProfile => {
  if (theme === 'simple') {
    return {
      baseTopOpacity: 0.72,
      baseMidOpacity: 0.44,
      baseBottomOpacity: 0.24,
      glowOpacity: 0.26,
      sheenOpacity: 0.6,
      edgeTopOpacity: 0.7,
      edgeBottomOpacity: 0.24,
      shadowOpacity: 0.1,
      liftOpacity: 0.32,
    };
  }

  if (theme === 'solid') {
    const isLight = getContrastColor(background) === '#18181b';
    if (isLight) {
      return {
        baseTopOpacity: 0.64,
        baseMidOpacity: 0.36,
        baseBottomOpacity: 0.22,
        glowOpacity: 0.24,
        sheenOpacity: 0.54,
        edgeTopOpacity: 0.62,
        edgeBottomOpacity: 0.22,
        shadowOpacity: 0.14,
        liftOpacity: 0.28,
      };
    }

    return {
      baseTopOpacity: 0.34,
      baseMidOpacity: 0.2,
      baseBottomOpacity: 0.16,
      glowOpacity: 0.18,
      sheenOpacity: 0.38,
      edgeTopOpacity: 0.52,
      edgeBottomOpacity: 0.15,
      shadowOpacity: 0.26,
      liftOpacity: 0.18,
    };
  }

  if (theme === 'dark') {
    return {
      baseTopOpacity: 0.3,
      baseMidOpacity: 0.2,
      baseBottomOpacity: 0.16,
      glowOpacity: 0.18,
      sheenOpacity: 0.34,
      edgeTopOpacity: 0.48,
      edgeBottomOpacity: 0.16,
      shadowOpacity: 0.28,
      liftOpacity: 0.14,
    };
  }

  return {
    baseTopOpacity: 0.42,
    baseMidOpacity: 0.24,
    baseBottomOpacity: 0.18,
    glowOpacity: 0.2,
    sheenOpacity: 0.42,
    edgeTopOpacity: 0.56,
    edgeBottomOpacity: 0.2,
    shadowOpacity: 0.22,
    liftOpacity: 0.2,
  };
};

const getSplitStatLabelBg = (theme: ThemeId, background: string) => {
  if (theme === 'simple') {
    return '#3f3f46';
  }

  if (theme === 'solid') {
    return getContrastColor(background) === '#18181b'
      ? 'rgba(24,24,27,0.72)'
      : 'rgba(0,0,0,0.38)';
  }

  return 'rgba(24,24,27,0.64)';
};

const extractPatternData = (patternUrl: string) => {
  const raw = patternUrl.replace(/^url\((['"]?)/, '').replace(/(['"]?)\)$/, '');
  const widthMatch = raw.match(/width%3D%22(\d+)%22/);
  const heightMatch = raw.match(/height%3D%22(\d+)%22/);

  return {
    dataUrl: raw,
    width: Number(widthMatch?.[1] ?? 120),
    height: Number(heightMatch?.[1] ?? 120),
  };
};

export const CardPreview = forwardRef<SVGSVGElement, CardPreviewProps>(({ data, config }, ref) => {
  const { messages } = useI18n();
  const width = CANVAS_WIDTH;
  const height = CANVAS_HEIGHT;
  const tokens = getThemeTokens(config.theme, config.colors.background);
  const fontFamily = getPreviewFontFamily(config.font);

  const patternFunction = patternFunctions[config.pattern.id];
  const patternData =
    config.pattern.id !== 'none' && patternFunction
      ? extractPatternData(patternFunction(tokens.patternColor, clamp(config.pattern.opacity, 0.05, 0.95)))
      : null;

  const visibleStats = getVisibleStats(config, data);
  const splitStatLabelBg = getSplitStatLabelBg(config.theme, config.colors.background);
  const glassStatProfile = getGlassStatProfile(config.theme, config.colors.background);

  const titleText = config.text.customTitle || data.name;
  const descriptionText = config.text.customDescription || data.description || messages.app.noDescription;
  const descriptionLines = buildDescriptionLines(
    descriptionText,
    config.layout.description.w,
    config.text.descriptionSize,
    3
  );
  const descriptionLineHeight = config.text.descriptionSize * 1.35;

  const visibleLanguages = getVisibleBadgeLanguages(config, data);
  const badgeOffsets = getBadgeOffsets(visibleLanguages, config.badge);

  const shouldRenderOwner = config.text.showOwner;
  const useInlineTitle = shouldRenderOwner && config.text.titleDisplay === 'inline';
  const ownerBaseline = config.text.ownerSize;
  const titleBaseline = shouldRenderOwner
    ? config.text.ownerSize + config.text.titleSize + 16
    : config.text.titleSize;
  const inlineTitleBaseline = Math.max(config.text.ownerSize, config.text.titleSize);

  const avatarSize = clamp(config.avatar.size, 40, 260);
  const avatarRadius = clamp(config.avatar.radius, 0, avatarSize / 2);

  const renderBackground = () => {
    if (config.theme === 'gradient') {
      return (
        <>
          <defs>
            <linearGradient id="canvas-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.colors.background} />
              <stop offset="100%" stopColor={config.colors.accent} />
            </linearGradient>
          </defs>
          <rect width={width} height={height} fill="url(#canvas-gradient)" />
        </>
      );
    }

    if (config.theme === 'simple') {
      return <rect width={width} height={height} fill="#ffffff" />;
    }

    if (config.theme === 'dark') {
      return <rect width={width} height={height} fill="#09090b" />;
    }

    return <rect width={width} height={height} fill={config.colors.background} />;
  };

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full max-w-full shadow-2xl"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      {renderBackground()}

      {patternData && (
        <>
          <defs>
            <pattern
              id="overlay-pattern"
              x="0"
              y="0"
              width={patternData.width * clamp(config.pattern.scale, 0.5, 4)}
              height={patternData.height * clamp(config.pattern.scale, 0.5, 4)}
              patternUnits="userSpaceOnUse"
              patternTransform={`translate(${config.pattern.offsetX}, ${config.pattern.offsetY})`}
            >
              <image
                href={patternData.dataUrl}
                width={patternData.width * clamp(config.pattern.scale, 0.5, 4)}
                height={patternData.height * clamp(config.pattern.scale, 0.5, 4)}
              />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#overlay-pattern)" />
        </>
      )}

      {config.avatar.visible && (
        <g transform={`translate(${config.layout.avatar.x}, ${config.layout.avatar.y})`}>
          {config.avatar.shape === 'circle' && (
            <circle cx={avatarSize / 2} cy={avatarSize / 2} r={avatarSize / 2} fill={tokens.cardBg} stroke={tokens.cardBorder} />
          )}
          {config.avatar.shape === 'rounded' && (
            <rect
              x="0"
              y="0"
              width={avatarSize}
              height={avatarSize}
              rx={avatarRadius}
              fill={tokens.cardBg}
              stroke={tokens.cardBorder}
            />
          )}

          {config.avatar.shape !== 'none' && (
            <defs>
              <clipPath id="avatar-clip-path">
                {config.avatar.shape === 'circle' ? (
                  <circle cx={avatarSize / 2} cy={avatarSize / 2} r={avatarSize / 2} />
                ) : (
                  <rect x="0" y="0" width={avatarSize} height={avatarSize} rx={avatarRadius} />
                )}
              </clipPath>
            </defs>
          )}

          <image
            id="card-avatar-image"
            x="0"
            y="0"
            width={avatarSize}
            height={avatarSize}
            xlinkHref={config.customLogo || data.avatarUrl}
            preserveAspectRatio={config.avatar.shape === 'none' ? 'xMidYMid meet' : 'xMidYMid slice'}
            clipPath={config.avatar.shape === 'none' ? undefined : 'url(#avatar-clip-path)'}
          />
        </g>
      )}

      <g transform={`translate(${config.layout.title.x}, ${config.layout.title.y})`}>
        {useInlineTitle ? (
          <text x="0" y={inlineTitleBaseline} fontFamily={fontFamily}>
            <tspan fill={tokens.secondaryText} fontSize={config.text.ownerSize} fontWeight="500">
              {data.owner} /
            </tspan>
            <tspan dx="8" fill={tokens.primaryText} fontSize={config.text.titleSize} fontWeight="800">
              {titleText}
            </tspan>
          </text>
        ) : (
          <>
            {shouldRenderOwner && (
              <text x="0" y={ownerBaseline} fill={tokens.secondaryText} fontFamily={fontFamily} fontSize={config.text.ownerSize} fontWeight="500">
                {data.owner} /
              </text>
            )}
            <text x="0" y={titleBaseline} fill={tokens.primaryText} fontFamily={fontFamily} fontSize={config.text.titleSize} fontWeight="800">
              {titleText}
            </text>
          </>
        )}
      </g>

      {descriptionLines.length > 0 && (
        <text
          x={config.layout.description.x}
          y={config.layout.description.y + config.text.descriptionSize}
          fill={tokens.secondaryText}
          fontFamily={fontFamily}
          fontSize={config.text.descriptionSize}
          fontWeight="400"
        >
          {descriptionLines.map((line, index) => (
            <tspan
              key={`${index}-${line}`}
              x={config.layout.description.x}
              dy={index === 0 ? 0 : descriptionLineHeight}
            >
              {line}
            </tspan>
          ))}
        </text>
      )}

      {visibleStats.length > 0 && (
        <g transform={`translate(${config.layout.stats.x}, ${config.layout.stats.y})`}>
          {visibleStats.map((stat, index) => {
            const x = index * (config.stats.itemWidth + config.stats.gap);
            if (config.stats.style === 'split') {
              const dividerX = Math.round(config.stats.itemWidth * config.stats.splitRatio);
              const splitRadius = Math.min(12, config.stats.itemHeight / 2);
              const clipId = `stat-split-clip-${stat.key}-${index}`;
              const splitValueBg = SPLIT_STAT_VALUE_BG[stat.key];
              const splitValueText = SPLIT_STAT_VALUE_TEXT[stat.key];
              const splitValueSize = config.stats.valueSize;
              const splitLabelSize = config.stats.labelSize;
              return (
                <g key={stat.key} transform={`translate(${x}, 0)`}>
                  <defs>
                    <clipPath id={clipId}>
                      <rect
                        x="0"
                        y="0"
                        width={config.stats.itemWidth}
                        height={config.stats.itemHeight}
                        rx={splitRadius}
                      />
                    </clipPath>
                  </defs>
                  <rect
                    x="0"
                    y="0"
                    width={config.stats.itemWidth}
                    height={config.stats.itemHeight}
                    rx={splitRadius}
                    fill={splitStatLabelBg}
                    stroke={tokens.cardBorder}
                  />
                  <rect
                    x={dividerX}
                    y="0"
                    width={config.stats.itemWidth - dividerX}
                    height={config.stats.itemHeight}
                    fill={splitValueBg}
                    clipPath={`url(#${clipId})`}
                  />
                  <line
                    x1={dividerX}
                    y1="0"
                    x2={dividerX}
                    y2={config.stats.itemHeight}
                    stroke={tokens.cardBorder}
                    strokeOpacity={0.7}
                  />
                  <text
                    x={dividerX / 2}
                    y={config.stats.itemHeight / 2 + splitLabelSize * 0.36}
                    fill="#ffffff"
                    fontFamily={fontFamily}
                    fontSize={splitLabelSize}
                    fontWeight="700"
                    letterSpacing={0.6}
                    textAnchor="middle"
                  >
                    {messages.card[stat.key]}
                  </text>
                  <text
                    x={dividerX + (config.stats.itemWidth - dividerX) / 2}
                    y={config.stats.itemHeight / 2 + splitValueSize * 0.35}
                    fill={splitValueText}
                    fontFamily={fontFamily}
                    fontSize={splitValueSize}
                    fontWeight="800"
                    textAnchor="middle"
                  >
                    {formatStatValue(stat.value, config.stats.valueFormat)}
                  </text>
                </g>
              );
            }

            const valueSize = clamp(config.stats.valueSize, 12, 48);
            const labelSize = clamp(config.stats.labelSize, 8, 32);
            const statRadius = Math.min(14, config.stats.itemHeight / 2);
            const statTint = CARD_STAT_GLASS_TINT[stat.key];
            const clipId = `stat-glass-clip-${stat.key}-${index}`;
            const baseGradientId = `stat-glass-base-${stat.key}-${index}`;
            const glowGradientId = `stat-glass-glow-${stat.key}-${index}`;
            const sheenGradientId = `stat-glass-sheen-${stat.key}-${index}`;
            const edgeGradientId = `stat-glass-edge-${stat.key}-${index}`;
            const shadowFilterId = `stat-glass-shadow-${stat.key}-${index}`;
            const topSheenHeight = Math.max(12, config.stats.itemHeight * 0.48);
            const glowHighlightOpacity = Math.min(glassStatProfile.glowOpacity + 0.2, 0.78);
            return (
              <g key={stat.key} transform={`translate(${x}, 0)`}>
                <defs>
                  <clipPath id={clipId}>
                    <rect
                      x="0"
                      y="0"
                      width={config.stats.itemWidth}
                      height={config.stats.itemHeight}
                      rx={statRadius}
                    />
                  </clipPath>
                  <linearGradient id={baseGradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={glassStatProfile.baseTopOpacity} />
                    <stop offset="58%" stopColor="#ffffff" stopOpacity={glassStatProfile.baseMidOpacity} />
                    <stop offset="100%" stopColor={statTint} stopOpacity={glassStatProfile.baseBottomOpacity} />
                  </linearGradient>
                  <radialGradient id={glowGradientId} cx="16%" cy="0%" r="125%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={glowHighlightOpacity} />
                    <stop offset="38%" stopColor={statTint} stopOpacity={glassStatProfile.glowOpacity} />
                    <stop offset="100%" stopColor={statTint} stopOpacity={0} />
                  </radialGradient>
                  <linearGradient id={sheenGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={glassStatProfile.sheenOpacity} />
                    <stop offset="56%" stopColor="#ffffff" stopOpacity={glassStatProfile.sheenOpacity * 0.32} />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id={edgeGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={glassStatProfile.edgeTopOpacity} />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity={glassStatProfile.edgeBottomOpacity} />
                  </linearGradient>
                  <filter id={shadowFilterId} x="-24%" y="-44%" width="148%" height="188%">
                    <feDropShadow
                      dx="0"
                      dy="10"
                      stdDeviation="10"
                      floodColor="#020617"
                      floodOpacity={glassStatProfile.shadowOpacity}
                    />
                    <feDropShadow
                      dx="0"
                      dy="1"
                      stdDeviation="1.4"
                      floodColor="#ffffff"
                      floodOpacity={glassStatProfile.liftOpacity}
                    />
                  </filter>
                </defs>
                <g filter={`url(#${shadowFilterId})`}>
                  <rect
                    x="0"
                    y="0"
                    width={config.stats.itemWidth}
                    height={config.stats.itemHeight}
                    rx={statRadius}
                    fill={`url(#${baseGradientId})`}
                    stroke={tokens.cardBorder}
                    strokeOpacity={0.46}
                  />
                  <rect
                    x="0"
                    y="0"
                    width={config.stats.itemWidth}
                    height={config.stats.itemHeight}
                    fill={`url(#${glowGradientId})`}
                    clipPath={`url(#${clipId})`}
                  />
                  <rect
                    x={1.5}
                    y={1.5}
                    width={Math.max(2, config.stats.itemWidth - 3)}
                    height={Math.max(8, topSheenHeight)}
                    rx={Math.max(4, statRadius - 1.5)}
                    fill={`url(#${sheenGradientId})`}
                    clipPath={`url(#${clipId})`}
                  />
                  <rect
                    x={0.5}
                    y={0.5}
                    width={Math.max(2, config.stats.itemWidth - 1)}
                    height={Math.max(2, config.stats.itemHeight - 1)}
                    rx={Math.max(4, statRadius - 0.5)}
                    fill="none"
                    stroke={`url(#${edgeGradientId})`}
                  />
                  <line
                    x1={Math.max(10, statRadius)}
                    y1={config.stats.itemHeight - 1.2}
                    x2={config.stats.itemWidth - Math.max(10, statRadius)}
                    y2={config.stats.itemHeight - 1.2}
                    stroke="#ffffff"
                    strokeOpacity={glassStatProfile.edgeBottomOpacity}
                    strokeLinecap="round"
                  />
                </g>
                <text
                  x={config.stats.itemWidth / 2}
                  y={config.stats.itemHeight / 2 + valueSize * 0.2 - 8}
                  fill={tokens.primaryText}
                  fontFamily={fontFamily}
                  fontSize={valueSize}
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {formatStatValue(stat.value, config.stats.valueFormat)}
                </text>
                <text
                  x={config.stats.itemWidth / 2}
                  y={config.stats.itemHeight - Math.max(8, labelSize * 0.75)}
                  fill={tokens.secondaryText}
                  fontFamily={fontFamily}
                  fontSize={labelSize}
                  fontWeight="600"
                  letterSpacing={0.4}
                  textAnchor="middle"
                >
                  {messages.card[stat.key]}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {config.badge.visible && visibleLanguages.length > 0 && (
        <g transform={`translate(${config.layout.badges.x}, ${config.layout.badges.y})`}>
          {visibleLanguages.map((language, index) => {
            const x = badgeOffsets[index] ?? 0;
            const badgeWidth = getBadgeWidth(language, config.badge);
            const badgeHeight = config.badge.height;
            const textY = badgeHeight / 2 + config.badge.fontSize * 0.35;

            if (config.badge.style === 'minimal') {
              const dotRadius = Math.max(4, config.badge.fontSize * 0.28);
              const dotColor = getLanguageDotColor(language, config.colors.accent);
              return (
                <g key={language} transform={`translate(${x}, 0)`}>
                  <circle cx={dotRadius} cy={badgeHeight / 2} r={dotRadius} fill={dotColor} />
                  <text
                    x={dotRadius * 2 + 8}
                    y={textY}
                    fill={tokens.primaryText}
                    fontFamily={fontFamily}
                    fontSize={config.badge.fontSize}
                    fontWeight="600"
                  >
                    {language}
                  </text>
                </g>
              );
            }

            return (
              <g key={language} transform={`translate(${x}, 0)`}>
                <rect
                  x="0"
                  y="0"
                  width={badgeWidth}
                  height={badgeHeight}
                  rx={badgeHeight / 2}
                  fill={config.badge.style === 'pill' ? tokens.cardBg : 'none'}
                  stroke={tokens.cardBorder}
                  strokeWidth={config.badge.style === 'outline' ? 2 : 1}
                />
                <text
                  x={badgeWidth / 2}
                  y={textY}
                  fill={tokens.primaryText}
                  fontFamily={fontFamily}
                  fontSize={config.badge.fontSize}
                  fontWeight="600"
                  textAnchor="middle"
                >
                  {language}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
});

CardPreview.displayName = 'CardPreview';
