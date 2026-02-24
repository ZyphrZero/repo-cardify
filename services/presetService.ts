import {
  AVATAR_SHAPE_OPTIONS,
  BADGE_STYLE_OPTIONS,
  CardConfig,
  FONT_OPTIONS,
  PATTERN_OPTIONS,
  THEME_OPTIONS,
  createDefaultCardConfig,
} from '../types';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isString = (value: unknown): value is string => typeof value === 'string';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const toNumber = (value: unknown, min: number, max: number, fallback: number) =>
  isNumber(value) ? clamp(value, min, max) : fallback;
const pickOptionValue = <T extends string>(
  value: unknown,
  options: Array<{ id: T }>,
  fallback: T
): T => (isString(value) && options.some((option) => option.id === value) ? (value as T) : fallback);

export const sanitizeCardConfig = (input: unknown): CardConfig | null => {
  if (!isObject(input)) return null;

  const defaults = createDefaultCardConfig();

  const colors = isObject(input.colors) ? input.colors : {};
  const pattern = isObject(input.pattern) ? input.pattern : {};
  const badge = isObject(input.badge) ? input.badge : {};
  const avatar = isObject(input.avatar) ? input.avatar : {};
  const stats = isObject(input.stats) ? input.stats : {};
  const text = isObject(input.text) ? input.text : {};
  const layout = isObject(input.layout) ? input.layout : {};
  const customLogoValue = input.customLogo;
  const customLogo = isString(customLogoValue) || customLogoValue === null
    ? (customLogoValue as string | null)
    : defaults.customLogo;

  const readLayoutRect = (key: keyof CardConfig['layout']) => {
    const rect = isObject(layout[key]) ? layout[key] : {};
    return {
      x: toNumber(rect.x, 0, 1200, defaults.layout[key].x),
      y: toNumber(rect.y, 0, 630, defaults.layout[key].y),
      w: toNumber(rect.w, 40, 1200, defaults.layout[key].w),
      h: toNumber(rect.h, 24, 630, defaults.layout[key].h),
    };
  };

  const config: CardConfig = {
    theme: pickOptionValue(input.theme, THEME_OPTIONS, defaults.theme),
    font: pickOptionValue(input.font, FONT_OPTIONS, defaults.font),
    colors: {
      background: isString(colors.background) ? colors.background : defaults.colors.background,
      accent: isString(colors.accent) ? colors.accent : defaults.colors.accent,
    },
    pattern: {
      id: pickOptionValue(pattern.id, PATTERN_OPTIONS, defaults.pattern.id),
      scale: isNumber(pattern.scale) ? clamp(pattern.scale, 0.5, 4) : defaults.pattern.scale,
      opacity: isNumber(pattern.opacity) ? clamp(pattern.opacity, 0.05, 0.95) : defaults.pattern.opacity,
      offsetX: isNumber(pattern.offsetX) ? clamp(pattern.offsetX, -600, 600) : defaults.pattern.offsetX,
      offsetY: isNumber(pattern.offsetY) ? clamp(pattern.offsetY, -400, 400) : defaults.pattern.offsetY,
    },
    badge: {
      visible: isBoolean(badge.visible) ? badge.visible : defaults.badge.visible,
      style: pickOptionValue(badge.style, BADGE_STYLE_OPTIONS, defaults.badge.style),
      fontSize: isNumber(badge.fontSize) ? clamp(badge.fontSize, 10, 48) : defaults.badge.fontSize,
      height: isNumber(badge.height) ? clamp(badge.height, 24, 100) : defaults.badge.height,
      paddingX: isNumber(badge.paddingX) ? clamp(badge.paddingX, 4, 48) : defaults.badge.paddingX,
      gap: isNumber(badge.gap) ? clamp(badge.gap, 0, 120) : defaults.badge.gap,
    },
    avatar: {
      visible: isBoolean(avatar.visible) ? avatar.visible : defaults.avatar.visible,
      shape: pickOptionValue(avatar.shape, AVATAR_SHAPE_OPTIONS, defaults.avatar.shape),
      size: isNumber(avatar.size) ? clamp(avatar.size, 40, 320) : defaults.avatar.size,
      radius: isNumber(avatar.radius) ? clamp(avatar.radius, 0, 160) : defaults.avatar.radius,
    },
    stats: {
      showStars: isBoolean(stats.showStars) ? stats.showStars : defaults.stats.showStars,
      showForks: isBoolean(stats.showForks) ? stats.showForks : defaults.stats.showForks,
      showIssues: isBoolean(stats.showIssues) ? stats.showIssues : defaults.stats.showIssues,
      itemWidth: isNumber(stats.itemWidth) ? clamp(stats.itemWidth, 80, 320) : defaults.stats.itemWidth,
      itemHeight: isNumber(stats.itemHeight) ? clamp(stats.itemHeight, 40, 140) : defaults.stats.itemHeight,
      gap: isNumber(stats.gap) ? clamp(stats.gap, 0, 120) : defaults.stats.gap,
    },
    text: {
      showOwner: isBoolean(text.showOwner) ? text.showOwner : defaults.text.showOwner,
      customTitle: isString(text.customTitle) ? text.customTitle : defaults.text.customTitle,
      customDescription: isString(text.customDescription) ? text.customDescription : defaults.text.customDescription,
      ownerSize: isNumber(text.ownerSize) ? clamp(text.ownerSize, 14, 80) : defaults.text.ownerSize,
      titleSize: isNumber(text.titleSize) ? clamp(text.titleSize, 24, 140) : defaults.text.titleSize,
      descriptionSize: isNumber(text.descriptionSize)
        ? clamp(text.descriptionSize, 14, 72)
        : defaults.text.descriptionSize,
    },
    layout: {
      avatar: readLayoutRect('avatar'),
      title: readLayoutRect('title'),
      description: readLayoutRect('description'),
      stats: readLayoutRect('stats'),
      badges: readLayoutRect('badges'),
    },
    customLogo,
  };

  return config;
};

export const exportConfigPreset = (config: CardConfig) => {
  const payload = JSON.stringify(config, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `repo-cardify-preset-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importConfigPreset = async (file: File): Promise<CardConfig> => {
  const text = await file.text();
  const raw = JSON.parse(text);
  const config = sanitizeCardConfig(raw);

  if (!config) {
    throw new Error('Invalid preset format.');
  }

  return config;
};
