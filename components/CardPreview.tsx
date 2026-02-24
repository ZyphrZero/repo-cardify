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
  FontId,
  PatternId,
  RepoData,
  ThemeId,
} from '../types';
import { useI18n } from './I18nContext';
import { getBadgeOffsets, getBadgeWidth, getVisibleStats } from './cardMetrics';

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

const FONT_FAMILY_MAP: Record<FontId, string> = {
  inter: "'Inter', sans-serif",
  mono: "'JetBrains Mono', monospace",
  serif: "'Merriweather', serif",
  poppins: "'Poppins', sans-serif",
  playfair: "'Playfair Display', serif",
  oswald: "'Oswald', sans-serif",
};

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
  const fontFamily = FONT_FAMILY_MAP[config.font];

  const patternFunction = patternFunctions[config.pattern.id];
  const patternData =
    config.pattern.id !== 'none' && patternFunction
      ? extractPatternData(patternFunction(tokens.patternColor, clamp(config.pattern.opacity, 0.05, 0.95)))
      : null;

  const visibleStats = getVisibleStats(config, data);

  const titleText = config.text.customTitle || data.name;
  const descriptionText = config.text.customDescription || data.description || messages.app.noDescription;

  const badgeOffsets = getBadgeOffsets(data.languages, config.badge);

  const ownerBaseline = config.text.ownerSize;
  const titleBaseline = config.text.showOwner
    ? config.text.ownerSize + config.text.titleSize + 16
    : config.text.titleSize;

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
      <defs>
        <style type="text/css">
          {`
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&family=Merriweather:wght@400;700&family=Oswald:wght@500;700&family=Playfair+Display:wght@600;800&family=Poppins:wght@400;600;800&display=swap');
          `}
        </style>
      </defs>

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
        {config.text.showOwner && (
          <text x="0" y={ownerBaseline} fill={tokens.secondaryText} fontFamily={fontFamily} fontSize={config.text.ownerSize} fontWeight="500">
            {data.owner} /
          </text>
        )}
        <text x="0" y={titleBaseline} fill={tokens.primaryText} fontFamily={fontFamily} fontSize={config.text.titleSize} fontWeight="800">
          {titleText}
        </text>
      </g>

      <foreignObject
        x={config.layout.description.x}
        y={config.layout.description.y}
        width={config.layout.description.w}
        height={config.layout.description.h}
      >
        <div
          {...({ xmlns: 'http://www.w3.org/1999/xhtml' } as any)}
          style={{
            fontFamily,
            color: tokens.secondaryText,
            fontSize: `${config.text.descriptionSize}px`,
            lineHeight: '1.35',
            fontWeight: 400,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
            height: '100%',
          }}
        >
          {descriptionText}
        </div>
      </foreignObject>

      {visibleStats.length > 0 && (
        <g transform={`translate(${config.layout.stats.x}, ${config.layout.stats.y})`}>
          {visibleStats.map((stat, index) => {
            const x = index * (config.stats.itemWidth + config.stats.gap);
            const valueSize = Math.max(18, Math.round(config.stats.itemHeight * 0.36));
            const labelSize = Math.max(12, Math.round(config.stats.itemHeight * 0.22));
            return (
              <g key={stat.key} transform={`translate(${x}, 0)`}>
                <rect
                  x="0"
                  y="0"
                  width={config.stats.itemWidth}
                  height={config.stats.itemHeight}
                  rx={Math.min(14, config.stats.itemHeight / 2)}
                  fill={tokens.cardBg}
                  stroke={tokens.cardBorder}
                />
                <text
                  x={config.stats.itemWidth / 2}
                  y={config.stats.itemHeight / 2 - 2}
                  fill={tokens.primaryText}
                  fontFamily={fontFamily}
                  fontSize={valueSize}
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {stat.value}
                </text>
                <text
                  x={config.stats.itemWidth / 2}
                  y={config.stats.itemHeight - 10}
                  fill={tokens.secondaryText}
                  fontFamily={fontFamily}
                  fontSize={labelSize}
                  textAnchor="middle"
                >
                  {messages.card[stat.key]}
                </text>
              </g>
            );
          })}
        </g>
      )}

      {config.badge.visible && data.languages.length > 0 && (
        <g transform={`translate(${config.layout.badges.x}, ${config.layout.badges.y})`}>
          {data.languages.map((language, index) => {
            const x = badgeOffsets[index] ?? 0;
            const badgeWidth = getBadgeWidth(language, config.badge);
            const badgeHeight = config.badge.height;
            const textY = badgeHeight / 2 + config.badge.fontSize * 0.35;

            if (config.badge.style === 'minimal') {
              const dotRadius = Math.max(4, config.badge.fontSize * 0.28);
              return (
                <g key={language} transform={`translate(${x}, 0)`}>
                  <circle cx={dotRadius} cy={badgeHeight / 2} r={dotRadius} fill={config.colors.accent} />
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
