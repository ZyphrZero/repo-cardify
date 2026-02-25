import {
  BadgeStyleId,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CardConfig,
  LayoutBlockId,
  LayoutRect,
  RepoData,
} from '../types';
import {
  estimateTextWidth,
  getBadgeWidth,
  getVisibleBadgeLanguages,
  getVisibleStats,
} from './cardMetrics';

export type AlignAction = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
export type DistributeAxis = 'horizontal' | 'vertical';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

const getMinimumSize = (block: LayoutBlockId) => {
  switch (block) {
    case 'avatar':
      return { minW: 40, minH: 40 };
    case 'title':
      return { minW: 140, minH: 60 };
    case 'description':
      return { minW: 220, minH: 80 };
    case 'stats':
      return { minW: 120, minH: 40 };
    case 'badges':
      return { minW: 120, minH: 28 };
    default:
      return { minW: 40, minH: 40 };
  }
};

const clampRectToCanvas = (rect: LayoutRect, minW: number, minH: number): LayoutRect => {
  const w = clamp(rect.w, minW, CANVAS_WIDTH);
  const h = clamp(rect.h, minH, CANVAS_HEIGHT);
  const x = clamp(rect.x, 0, CANVAS_WIDTH - w);
  const y = clamp(rect.y, 0, CANVAS_HEIGHT - h);
  return { x, y, w, h };
};

const getBadgeExtraPerItem = (style: BadgeStyleId, fontSize: number, paddingX: number) => {
  if (style === 'minimal') {
    return paddingX + Math.max(10, fontSize * 0.65);
  }
  return paddingX * 2;
};

export const applyRectToConfig = (
  config: CardConfig,
  data: RepoData,
  block: LayoutBlockId,
  targetRect: LayoutRect
): CardConfig => {
  const { minW, minH } = getMinimumSize(block);
  const rect = clampRectToCanvas(targetRect, minW, minH);

  if (block === 'avatar') {
    const size = clamp(Math.round(Math.max(rect.w, rect.h)), 40, 320);
    return {
      ...config,
      avatar: {
        ...config.avatar,
        size,
      },
      layout: {
        ...config.layout,
        avatar: {
          ...config.layout.avatar,
          x: clamp(rect.x, 0, CANVAS_WIDTH - size),
          y: clamp(rect.y, 0, CANVAS_HEIGHT - size),
          w: size,
          h: size,
        },
      },
    };
  }

  if (block === 'title' || block === 'description') {
    return {
      ...config,
      layout: {
        ...config.layout,
        [block]: {
          ...config.layout[block],
          x: rect.x,
          y: rect.y,
          w: rect.w,
          h: rect.h,
        },
      },
    };
  }

  if (block === 'stats') {
    const visibleCount = Math.max(1, getVisibleStats(config, data).length);
    const itemHeight = clamp(Math.round(rect.h), 40, 140);
    const rawItemWidth = (rect.w - config.stats.gap * (visibleCount - 1)) / visibleCount;
    const itemWidth = clamp(Math.round(rawItemWidth), 80, 320);
    const actualWidth = visibleCount * itemWidth + (visibleCount - 1) * config.stats.gap;

    return {
      ...config,
      stats: {
        ...config.stats,
        itemWidth,
        itemHeight,
      },
      layout: {
        ...config.layout,
        stats: {
          ...config.layout.stats,
          x: clamp(rect.x, 0, CANVAS_WIDTH - actualWidth),
          y: rect.y,
          w: actualWidth,
          h: itemHeight,
        },
      },
    };
  }

  if (block === 'badges') {
    const languages = getVisibleBadgeLanguages(config, data);
    const itemCount = languages.length;
    const height = clamp(Math.round(rect.h), 24, 100);
    const fontSize = clamp(Math.round(height * 0.42), 10, 48);

    if (itemCount === 0) {
      return {
        ...config,
        badge: {
          ...config.badge,
          height,
          fontSize,
        },
        layout: {
          ...config.layout,
          badges: {
            ...config.layout.badges,
            x: rect.x,
            y: rect.y,
            w: rect.w,
            h: height,
          },
        },
      };
    }

    const textWidths = languages.map((language) => estimateTextWidth(language, fontSize));
    const extraPerItem = getBadgeExtraPerItem(config.badge.style, fontSize, config.badge.paddingX);
    const baseWidth = sum(textWidths.map((width) => width + extraPerItem));
    const gap =
      itemCount > 1 ? clamp(Math.round((rect.w - baseWidth) / (itemCount - 1)), 0, 120) : config.badge.gap;

    const tempBadge = {
      ...config.badge,
      fontSize,
      height,
      gap,
    };
    const finalWidth = sum(languages.map((language) => getBadgeWidth(language, tempBadge))) + gap * Math.max(0, itemCount - 1);

    return {
      ...config,
      badge: {
        ...config.badge,
        fontSize,
        height,
        gap,
      },
      layout: {
        ...config.layout,
        badges: {
          ...config.layout.badges,
          x: clamp(rect.x, 0, CANVAS_WIDTH - finalWidth),
          y: rect.y,
          w: finalWidth,
          h: height,
        },
      },
    };
  }

  return config;
};

export const alignSelectedBlocks = (
  config: CardConfig,
  selected: LayoutBlockId[],
  interactiveRects: Record<LayoutBlockId, LayoutRect>,
  action: AlignAction
): CardConfig => {
  if (selected.length < 2) return config;

  let target = 0;
  if (action === 'left') target = Math.min(...selected.map((block) => interactiveRects[block].x));
  if (action === 'center') target = sum(selected.map((block) => interactiveRects[block].x + interactiveRects[block].w / 2)) / selected.length;
  if (action === 'right') target = Math.max(...selected.map((block) => interactiveRects[block].x + interactiveRects[block].w));
  if (action === 'top') target = Math.min(...selected.map((block) => interactiveRects[block].y));
  if (action === 'middle') target = sum(selected.map((block) => interactiveRects[block].y + interactiveRects[block].h / 2)) / selected.length;
  if (action === 'bottom') target = Math.max(...selected.map((block) => interactiveRects[block].y + interactiveRects[block].h));

  const nextLayout = { ...config.layout };

  for (const block of selected) {
    const rect = interactiveRects[block];

    if (action === 'left') {
      nextLayout[block] = { ...nextLayout[block], x: clamp(target, 0, CANVAS_WIDTH - rect.w) };
    }
    if (action === 'center') {
      nextLayout[block] = { ...nextLayout[block], x: clamp(target - rect.w / 2, 0, CANVAS_WIDTH - rect.w) };
    }
    if (action === 'right') {
      nextLayout[block] = { ...nextLayout[block], x: clamp(target - rect.w, 0, CANVAS_WIDTH - rect.w) };
    }
    if (action === 'top') {
      nextLayout[block] = { ...nextLayout[block], y: clamp(target, 0, CANVAS_HEIGHT - rect.h) };
    }
    if (action === 'middle') {
      nextLayout[block] = { ...nextLayout[block], y: clamp(target - rect.h / 2, 0, CANVAS_HEIGHT - rect.h) };
    }
    if (action === 'bottom') {
      nextLayout[block] = { ...nextLayout[block], y: clamp(target - rect.h, 0, CANVAS_HEIGHT - rect.h) };
    }
  }

  return {
    ...config,
    layout: nextLayout,
  };
};

export const distributeSelectedBlocks = (
  config: CardConfig,
  selected: LayoutBlockId[],
  interactiveRects: Record<LayoutBlockId, LayoutRect>,
  axis: DistributeAxis
): CardConfig => {
  if (selected.length < 3) return config;

  const sorted = [...selected].sort((a, b) =>
    axis === 'horizontal' ? interactiveRects[a].x - interactiveRects[b].x : interactiveRects[a].y - interactiveRects[b].y
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const middle = sorted.slice(1, -1);
  if (middle.length === 0) return config;

  const firstStart = axis === 'horizontal' ? interactiveRects[first].x : interactiveRects[first].y;
  const lastEnd =
    axis === 'horizontal'
      ? interactiveRects[last].x + interactiveRects[last].w
      : interactiveRects[last].y + interactiveRects[last].h;

  const middleTotal = sum(
    middle.map((block) => (axis === 'horizontal' ? interactiveRects[block].w : interactiveRects[block].h))
  );
  const available = lastEnd - firstStart - middleTotal;
  const gap = available / (sorted.length - 1);

  const nextLayout = { ...config.layout };
  let cursor =
    firstStart + (axis === 'horizontal' ? interactiveRects[first].w : interactiveRects[first].h) + gap;

  for (const block of middle) {
    const rect = interactiveRects[block];
    if (axis === 'horizontal') {
      const x = clamp(cursor, 0, CANVAS_WIDTH - rect.w);
      nextLayout[block] = { ...nextLayout[block], x };
      cursor = x + rect.w + gap;
    } else {
      const y = clamp(cursor, 0, CANVAS_HEIGHT - rect.h);
      nextLayout[block] = { ...nextLayout[block], y };
      cursor = y + rect.h + gap;
    }
  }

  return {
    ...config,
    layout: nextLayout,
  };
};
