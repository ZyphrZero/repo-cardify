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
import { RepoData, CardConfig, ThemeType, FontType, PatternType, BadgeStyle, AvatarBackgroundType } from '../types';

interface CardPreviewProps {
  data: RepoData;
  config: CardConfig;
}

// Map logical fonts to CSS font families
const fontMap: Record<FontType, string> = {
  [FontType.Inter]: "'Inter', sans-serif",
  [FontType.Mono]: "'JetBrains Mono', monospace",
  [FontType.Serif]: "'Merriweather', serif",
  [FontType.Poppins]: "'Poppins', sans-serif",
  [FontType.Playfair]: "'Playfair Display', serif",
  [FontType.Oswald]: "'Oswald', sans-serif",
};

// Helper: Get contrast color (black or white) for text based on bg
const getContrastColor = (hex: string) => {
  let c = hex.substring(1).split('');
  if(c.length === 3){
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  let cStr = c.join('');
  let r = parseInt(cStr.substring(0,2), 16);
  let g = parseInt(cStr.substring(2,4), 16);
  let b = parseInt(cStr.substring(4,6), 16);
  let yiq = ((r*299)+(g*587)+(b*114))/1000;
  return (yiq >= 128) ? '#18181b' : '#ffffff';
}

export const CardPreview = forwardRef<SVGSVGElement, CardPreviewProps>(({ data, config }, ref) => {
  const width = 1200;
  const height = 630;
  
  // --- COLOR LOGIC ---
  const fontFamily = fontMap[config.font];
  
  // Determine Base Colors
  let primaryText = '#ffffff';
  let secondaryText = '#e4e4e7';
  let accentColor = config.bgColor; // Used for highlights in Simple/Dark modes
  let cardBg = 'rgba(255,255,255,0.1)';
  let cardBorder = 'rgba(255,255,255,0.2)';

  if (config.theme === ThemeType.Simple) {
    primaryText = '#18181b';
    secondaryText = '#52525b';
    cardBg = 'rgba(0,0,0,0.03)';
    cardBorder = 'rgba(0,0,0,0.08)';
  } else if (config.theme === ThemeType.Dark) {
    primaryText = '#ffffff';
    secondaryText = '#a1a1aa';
    cardBg = 'rgba(255,255,255,0.05)';
    cardBorder = 'rgba(255,255,255,0.1)';
  } else if (config.theme === ThemeType.Solid) {
    // Auto contrast
    const contrast = getContrastColor(config.bgColor);
    const isLight = contrast === '#18181b';
    primaryText = contrast;
    secondaryText = isLight ? '#52525b' : '#e4e4e7';
    cardBg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';
    cardBorder = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)';
    accentColor = primaryText; 
  } else {
    // Gradient
    primaryText = '#ffffff';
    secondaryText = '#e4e4e7';
    cardBg = 'rgba(255,255,255,0.1)';
    cardBorder = 'rgba(255,255,255,0.2)';
  }

  // Background Rendering
  const renderBackground = () => {
    switch (config.theme) {
      case ThemeType.Gradient:
        return (
          <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.bgColor} />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
            <rect width={width} height={height} fill="url(#bgGradient)" />
          </defs>
        );
      case ThemeType.Simple:
        return <rect width={width} height={height} fill="#ffffff" />;
      case ThemeType.Dark:
          return <rect width={width} height={height} fill="#09090b" />;
      case ThemeType.Solid:
      default:
        return <rect width={width} height={height} fill={config.bgColor} />;
    }
  };

  const patternFunctions: Partial<Record<PatternType, (color: string, opacity: number) => string>> = {
    [PatternType.Signal]: signal,
    [PatternType.CharlieBrown]: charlieBrown,
    [PatternType.FormalInvitation]: formalInvitation,
    [PatternType.Plus]: plus,
    [PatternType.CircuitBoard]: circuitBoard,
    [PatternType.OverlappingHexagons]: overlappingHexagons,
    [PatternType.BrickWall]: brickWall,
    [PatternType.FloatingCogs]: floatingCogs,
    [PatternType.DiagonalStripes]: diagonalStripes,
  };

  const getHeroPattern = () => {
    const patternFunction = patternFunctions[config.pattern];
    if (!patternFunction) return null;

    const isSolidDark = config.theme === ThemeType.Solid
      ? getContrastColor(config.bgColor) === '#ffffff'
      : false;
    const isDarkTheme = config.theme === ThemeType.Dark || config.theme === ThemeType.Gradient || isSolidDark;
    const [patternColor, patternOpacity] = isDarkTheme ? ['#eaeaea', 0.2] : ['#eaeaea', 0.6];

    let patternImageUrl = patternFunction(patternColor, patternOpacity);
    const widthMatch = patternImageUrl.match(/width%3D%22(\d+)%22/);
    const heightMatch = patternImageUrl.match(/height%3D%22(\d+)%22/);
    const baseWidth = Number(widthMatch?.[1] ?? 100);
    const baseHeight = Number(heightMatch?.[1] ?? 100);
    
    // 使用可配置的缩放比例，默认为 1.0
    const scale = config.patternScale ?? 1.0;
    const width = baseWidth * scale;
    const height = baseHeight * scale;

    patternImageUrl = patternImageUrl
      .replace(/^url\(['"]?/, 'url(')
      .replace(/['"]?\)$/, ')');

    const dataUrl = patternImageUrl.replace(/^url\(/, '').replace(/\)$/, '');

    return { dataUrl, width, height };
  };

  const heroPattern = getHeroPattern();

  // Stats Component
  const StatBadge = ({ value, label, x }: { value: number, label: string, x: number }) => (
    <g transform={`translate(${x}, 0)`}>
      <rect x="0" y="0" width="140" height="60" rx="12" fill={cardBg} stroke={cardBorder} />
      <text x="70" y="28" fill={primaryText} fontFamily={fontFamily} fontSize="20" fontWeight="bold" textAnchor="middle">{value}</text>
      <text x="70" y="48" fill={secondaryText} fontFamily={fontFamily} fontSize="14" textAnchor="middle">{label}</text>
    </g>
  );

  // Badge Component - 计算累积偏移量
  const calculateMinimalOffset = (languages: string[], currentIndex: number): number => {
    let offset = 0;
    for (let i = 0; i < currentIndex; i++) {
      // 估算文本宽度：每个字符约 10.8px (fontSize 18 * 0.6)
      const textWidth = languages[i].length * 10.8;
      // 圆点 + 间距 + 文本 + 右边距
      offset += 10 + 15 + textWidth + 30;
    }
    return offset;
  };

  const TechBadge = ({ lang, index }: { lang: string, index: number }) => {
     let xOffset: number;
     
     if (config.badgeStyle === BadgeStyle.Minimal) {
         xOffset = calculateMinimalOffset(data.languages, index);
         return (
            <g transform={`translate(${xOffset}, 0)`}>
                <circle cx="10" cy="20" r="6" fill={accentColor} />
                <text x="25" y="26" fill={primaryText} fontFamily={fontFamily} fontSize="18" fontWeight="600">{lang}</text>
            </g>
         );
     }
     
     xOffset = index * 140;
     
     if (config.badgeStyle === BadgeStyle.Outline) {
         return (
             <g transform={`translate(${xOffset}, 0)`}>
                <rect x="0" y="0" width="120" height="40" rx="20" fill="none" stroke={cardBorder} strokeWidth="2" />
                <text x="60" y="26" fill={primaryText} fontFamily={fontFamily} fontSize="16" fontWeight="600" textAnchor="middle">{lang}</text>
             </g>
         );
     }
     
     // Pill
     return (
        <g transform={`translate(${xOffset}, 0)`}>
           <rect x="0" y="0" width="120" height="40" rx="20" fill={cardBg} stroke={cardBorder} strokeWidth="0.5" />
           <text x="60" y="26" fill={primaryText} fontFamily={fontFamily} fontSize="16" fontWeight="600" textAnchor="middle">{lang}</text>
        </g>
     );
  };
  
  const visibleStats = [
      { key: 'showStars', value: data.stars, label: 'Stars' },
      { key: 'showForks', value: data.forks, label: 'Forks' },
      { key: 'showIssues', value: data.issues, label: 'Issues' },
  ].filter(s => (config as any)[s.key]);

  return (
    <svg
      ref={ref}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto max-w-full shadow-2xl"
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

      {/* 1. Background */}
      {renderBackground()}

      {/* 2. Pattern Overlay */}
      {heroPattern && (
        <>
          <defs>
            <pattern
              id="hero-pattern"
              x="0"
              y="0"
              width={heroPattern.width}
              height={heroPattern.height}
              patternUnits="userSpaceOnUse"
            >
              <image
                href={heroPattern.dataUrl}
                width={heroPattern.width}
                height={heroPattern.height}
              />
            </pattern>
          </defs>
          <rect width={width} height={height} fill="url(#hero-pattern)" />
        </>
      )}

      {/* 3. Content Container */}
      <g transform="translate(100, 100)">
        
        {/* Header: Avatar + User/Repo */}
        <g>
           {/* Avatar Section */}
           {config.showAvatar && (
              <g>
                {config.avatarBackground === AvatarBackgroundType.Circle && (
                  <circle cx="60" cy="60" r="60" fill={cardBg} stroke={cardBorder} />
                )}
                {config.avatarBackground === AvatarBackgroundType.Rounded && (
                  <rect
                    x="0"
                    y="0"
                    width="120"
                    height="120"
                    rx={Math.max(0, Math.min(60, config.avatarRadius))}
                    fill={cardBg}
                    stroke={cardBorder}
                  />
                )}
                {config.avatarBackground !== AvatarBackgroundType.None && (
                  <defs>
                    <clipPath id="avatar-clip">
                      {config.avatarBackground === AvatarBackgroundType.Circle ? (
                        <circle cx="60" cy="60" r="60" />
                      ) : (
                        <rect
                          x="0"
                          y="0"
                          width="120"
                          height="120"
                          rx={Math.max(0, Math.min(60, config.avatarRadius))}
                        />
                      )}
                    </clipPath>
                  </defs>
                )}
                <image 
                    x="0"
                    y="0"
                    width="120"
                    height="120"
                    xlinkHref={config.customLogo || data.avatarUrl}
                    preserveAspectRatio={config.avatarBackground === AvatarBackgroundType.None ? "xMidYMid meet" : "xMidYMid slice"}
                    clipPath={config.avatarBackground === AvatarBackgroundType.None ? undefined : "url(#avatar-clip)"}
                />
              </g>
           )}
           
           <g transform={`translate(${config.showAvatar ? 150 : 0}, 45)`}>
              {config.showOwner && (
                <text 
                    x="0" 
                    y="0" 
                    fill={secondaryText} 
                    fontFamily={fontFamily} 
                    fontSize="32"
                    fontWeight="500"
                >
                    {data.owner} /
                </text>
              )}
              <text 
                x="0" 
                y={config.showOwner ? 60 : 20} 
                fill={primaryText} 
                fontFamily={fontFamily} 
                fontSize="64" 
                fontWeight="800"
              >
                {config.customTitle || data.name}
              </text>
           </g>
        </g>

        {/* Description */}
        <foreignObject x="0" y="160" width="1000" height="200">
           <div
             {...{ xmlns: "http://www.w3.org/1999/xhtml" } as any}
             style={{
               fontFamily: fontFamily, // Use the resolved CSS font string
               color: secondaryText,
               fontSize: '36px',
               lineHeight: '1.4',
               fontWeight: '400',
               display: '-webkit-box',
               WebkitLineClamp: 3,
               WebkitBoxOrient: 'vertical',
               overflow: 'hidden',
               textOverflow: 'ellipsis',
               height: '100%'
           }}>
             {config.customDescription}
           </div>
        </foreignObject>

        {/* Stats Row */}
        {visibleStats.length > 0 && (
            <g transform="translate(0, 380)">
                {visibleStats.map((stat, i) => (
                    <StatBadge key={stat.label} value={stat.value} label={stat.label} x={i * 160} />
                ))}
            </g>
        )}

        {/* Badges / Tech Stack */}
        {config.showBadges && data.languages.length > 0 && (
             <g transform={`translate(${visibleStats.length > 0 ? (visibleStats.length * 160) + 20 : 0}, ${visibleStats.length > 0 ? 395 : 380})`}>
                {data.languages.map((lang, index) => (
                    <TechBadge key={lang} lang={lang} index={index} />
                ))}
             </g>
        )}

      </g>
    </svg>
  );
});

CardPreview.displayName = "CardPreview";
