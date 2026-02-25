export const CANVAS_WIDTH = 1200;
export const CANVAS_HEIGHT = 630;

export type ThemeId = "gradient" | "solid" | "simple" | "dark";
export type FontId =
  | "inter"
  | "mono"
  | "serif"
  | "poppins"
  | "playfair"
  | "oswald";
export type PatternId =
  | "none"
  | "signal"
  | "charlie-brown"
  | "formal-invitation"
  | "plus"
  | "circuit-board"
  | "overlapping-hexagons"
  | "brick-wall"
  | "floating-cogs"
  | "diagonal-stripes";
export type BadgeStyleId = "pill" | "outline" | "minimal";
export type AvatarShapeId = "none" | "circle" | "rounded";
export type StatsValueFormatId = "compact" | "full";
export type StatsStyleId = "card" | "split";
export type TitleDisplayModeId = "split" | "inline";
export type LayoutBlockId =
  | "avatar"
  | "title"
  | "description"
  | "stats"
  | "badges";

export const THEME_OPTIONS: Array<{ id: ThemeId; label: string }> = [
  { id: "gradient", label: "Gradient" },
  { id: "solid", label: "Solid" },
  { id: "simple", label: "Simple" },
  { id: "dark", label: "Dark" },
];

export const FONT_OPTIONS: Array<{
  id: FontId;
  label: string;
  family: string;
}> = [
  { id: "inter", label: "Inter", family: "'Inter', sans-serif" },
  {
    id: "mono",
    label: "JetBrains Mono",
    family: "'JetBrains Mono', monospace",
  },
  { id: "serif", label: "Merriweather", family: "'Merriweather', serif" },
  { id: "poppins", label: "Poppins", family: "'Poppins', sans-serif" },
  {
    id: "playfair",
    label: "Playfair Display",
    family: "'Playfair Display', serif",
  },
  { id: "oswald", label: "Oswald", family: "'Oswald', sans-serif" },
];

export const PATTERN_OPTIONS: Array<{ id: PatternId; label: string }> = [
  { id: "none", label: "None" },
  { id: "signal", label: "Signal" },
  { id: "charlie-brown", label: "Charlie Brown" },
  { id: "formal-invitation", label: "Formal Invitation" },
  { id: "plus", label: "Plus" },
  { id: "circuit-board", label: "Circuit Board" },
  { id: "overlapping-hexagons", label: "Overlapping Hexagons" },
  { id: "brick-wall", label: "Brick Wall" },
  { id: "floating-cogs", label: "Floating Cogs" },
  { id: "diagonal-stripes", label: "Diagonal Stripes" },
];

export const BADGE_STYLE_OPTIONS: Array<{ id: BadgeStyleId; label: string }> = [
  { id: "minimal", label: "Minimal" },
  { id: "pill", label: "Pill" },
  { id: "outline", label: "Outline" },
];

export const AVATAR_SHAPE_OPTIONS: Array<{ id: AvatarShapeId; label: string }> =
  [
    { id: "none", label: "None" },
    { id: "circle", label: "Circle" },
    { id: "rounded", label: "Rounded" },
  ];

export const STATS_VALUE_FORMAT_OPTIONS: Array<{
  id: StatsValueFormatId;
  label: string;
}> = [
  { id: "compact", label: "Compact" },
  { id: "full", label: "Full" },
];

export const STATS_STYLE_OPTIONS: Array<{ id: StatsStyleId; label: string }> = [
  { id: "card", label: "Glass" },
  { id: "split", label: "Split" },
];

export const STATS_STYLE_DEFAULTS: Record<
  StatsStyleId,
  Pick<StatsConfig, 'itemWidth' | 'itemHeight' | 'gap' | 'valueSize' | 'labelSize' | 'splitRatio'>
> = {
  card: {
    itemWidth: 150,
    itemHeight: 85,
    gap: 20,
    valueSize: 28,
    labelSize: 18,
    splitRatio: 0.45,
  },
  split: {
    itemWidth: 160,
    itemHeight: 70,
    gap: 20,
    valueSize: 20,
    labelSize: 18,
    splitRatio: 0.45,
  },
};

export const TITLE_DISPLAY_MODE_OPTIONS: Array<{ id: TitleDisplayModeId; label: string }> = [
  { id: "split", label: "Split Lines" },
  { id: "inline", label: "Inline" },
];

export const LAYOUT_BLOCK_LABELS: Record<LayoutBlockId, string> = {
  avatar: "Avatar",
  title: "Title",
  description: "Description",
  stats: "Stats Row",
  badges: "Badges Row",
};

export interface RepoData {
  owner: string;
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  issues: number;
  language: string | null;
  languages: string[];
  avatarUrl: string;
}

export interface LayoutRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutConfig {
  avatar: LayoutRect;
  title: LayoutRect;
  description: LayoutRect;
  stats: LayoutRect;
  badges: LayoutRect;
}

export interface PatternConfig {
  id: PatternId;
  scale: number;
  opacity: number;
  offsetX: number;
  offsetY: number;
}

export interface BadgeConfig {
  visible: boolean;
  style: BadgeStyleId;
  fontSize: number;
  height: number;
  paddingX: number;
  gap: number;
  hiddenLanguages: string[];
}

export interface AvatarConfig {
  visible: boolean;
  shape: AvatarShapeId;
  size: number;
  radius: number;
}

export interface StatsConfig {
  showStars: boolean;
  showForks: boolean;
  showIssues: boolean;
  valueFormat: StatsValueFormatId;
  style: StatsStyleId;
  itemWidth: number;
  itemHeight: number;
  gap: number;
  valueSize: number;
  labelSize: number;
  splitRatio: number;
}

export interface TextConfig {
  showOwner: boolean;
  titleDisplay: TitleDisplayModeId;
  customTitle: string;
  customDescription: string;
  ownerSize: number;
  titleSize: number;
  descriptionSize: number;
}

export interface ColorConfig {
  background: string;
  accent: string;
}

export interface CardConfig {
  theme: ThemeId;
  font: FontId;
  colors: ColorConfig;
  pattern: PatternConfig;
  badge: BadgeConfig;
  avatar: AvatarConfig;
  stats: StatsConfig;
  text: TextConfig;
  layout: LayoutConfig;
  customLogo: string | null;
}

const DEFAULT_LAYOUT_TEMPLATE: LayoutConfig = {
  avatar: { x: 100, y: 100, w: 120, h: 120 },
  title: { x: 250, y: 100, w: 850, h: 150 },
  description: { x: 100, y: 275, w: 1000, h: 150 },
  stats: { x: 100, y: 464, w: 489.9996, h: 85 },
  badges: { x: 675, y: 464, w: 483.8796, h: 72 },
};

export const createDefaultLayout = (): LayoutConfig => ({
  avatar: { ...DEFAULT_LAYOUT_TEMPLATE.avatar },
  title: { ...DEFAULT_LAYOUT_TEMPLATE.title },
  description: { ...DEFAULT_LAYOUT_TEMPLATE.description },
  stats: { ...DEFAULT_LAYOUT_TEMPLATE.stats },
  badges: { ...DEFAULT_LAYOUT_TEMPLATE.badges },
});

export const createDefaultCardConfig = (): CardConfig => ({
  theme: "gradient",
  font: "inter",
  colors: {
    background: "#a3a3a3",
    accent: "#09090b",
  },
  pattern: {
    id: "none",
    scale: 1.8,
    opacity: 0.1,
    offsetX: 0,
    offsetY: 0,
  },
  badge: {
    visible: true,
    style: "minimal",
    fontSize: 28,
    height: 72,
    paddingX: 20,
    gap: 20,
    hiddenLanguages: [],
  },
  avatar: {
    visible: true,
    shape: "rounded",
    size: 120,
    radius: 24,
  },
  stats: {
    showStars: true,
    showForks: true,
    showIssues: true,
    valueFormat: "full",
    style: "card",
    ...STATS_STYLE_DEFAULTS.card,
  },
  text: {
    showOwner: true,
    titleDisplay: "split",
    customTitle: "",
    customDescription: "",
    ownerSize: 32,
    titleSize: 64,
    descriptionSize: 36,
  },
  layout: createDefaultLayout(),
  customLogo: null,
});
