import { BadgeConfig, CardConfig, LayoutBlockId, LayoutRect, RepoData } from '../types';

export const estimateTextWidth = (value: string, fontSize: number) => Math.max(fontSize * 1.5, value.length * fontSize * 0.56);

export const getBadgeWidth = (value: string, badge: BadgeConfig) => {
  const textWidth = estimateTextWidth(value, badge.fontSize);
  if (badge.style === 'minimal') {
    return textWidth + badge.paddingX + Math.max(10, badge.fontSize * 0.65);
  }
  return textWidth + badge.paddingX * 2;
};

export const getBadgeOffsets = (languages: string[], badge: BadgeConfig) => {
  const offsets: number[] = [];
  let runningX = 0;

  for (const language of languages) {
    offsets.push(runningX);
    runningX += getBadgeWidth(language, badge) + badge.gap;
  }

  return offsets;
};

export const getBadgeRowWidth = (languages: string[], badge: BadgeConfig) => {
  const offsets = getBadgeOffsets(languages, badge);
  if (languages.length === 0) return 0;
  const lastIndex = languages.length - 1;
  return offsets[lastIndex] + getBadgeWidth(languages[lastIndex], badge);
};

export const getVisibleStats = (config: CardConfig, data: RepoData) =>
  [
    { enabled: config.stats.showStars, value: data.stars, key: 'stars' as const },
    { enabled: config.stats.showForks, value: data.forks, key: 'forks' as const },
    { enabled: config.stats.showIssues, value: data.issues, key: 'issues' as const },
  ].filter((item) => item.enabled);

export const getInteractiveLayoutRects = (config: CardConfig, data: RepoData): Record<LayoutBlockId, LayoutRect> => {
  const visibleStats = getVisibleStats(config, data);
  const statsWidth =
    visibleStats.length > 0
      ? visibleStats.length * config.stats.itemWidth + (visibleStats.length - 1) * config.stats.gap
      : config.layout.stats.w;

  const badgesWidth = config.badge.visible ? getBadgeRowWidth(data.languages, config.badge) : config.layout.badges.w;

  return {
    avatar: {
      x: config.layout.avatar.x,
      y: config.layout.avatar.y,
      w: config.avatar.size,
      h: config.avatar.size,
    },
    title: {
      ...config.layout.title,
    },
    description: {
      ...config.layout.description,
    },
    stats: {
      x: config.layout.stats.x,
      y: config.layout.stats.y,
      w: Math.max(120, statsWidth),
      h: Math.max(40, config.stats.itemHeight),
    },
    badges: {
      x: config.layout.badges.x,
      y: config.layout.badges.y,
      w: Math.max(120, badgesWidth),
      h: Math.max(32, config.badge.height),
    },
  };
};
