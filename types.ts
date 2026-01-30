export enum ThemeType {
  Simple = 'Simple',
  Gradient = 'Gradient',
  Solid = 'Solid',
  Dark = 'Dark'
}

export enum FontType {
  Inter = 'Inter',
  Mono = 'JetBrains Mono',
  Serif = 'Merriweather',
  Poppins = 'Poppins',
  Playfair = 'Playfair Display',
  Oswald = 'Oswald'
}

export enum PatternType {
  None = 'None',
  Signal = 'Signal',
  CharlieBrown = 'Charlie Brown',
  FormalInvitation = 'Formal Invitation',
  Plus = 'Plus',
  CircuitBoard = 'Circuit Board',
  OverlappingHexagons = 'Overlapping Hexagons',
  BrickWall = 'Brick Wall',
  FloatingCogs = 'Floating Cogs',
  DiagonalStripes = 'Diagonal Stripes'
}

export enum BadgeStyle {
  Pill = 'Pill',
  Outline = 'Outline',
  Minimal = 'Minimal'
}

export enum AvatarBackgroundType {
  None = 'None',
  Circle = 'Circle',
  Rounded = 'Rounded'
}

export interface RepoData {
  owner: string;
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  issues: number;
  language: string | null;
  languages: string[]; // Top languages
  avatarUrl: string; // Base64 encoded for canvas safety
}

export interface CardConfig {
  theme: ThemeType;
  font: FontType;
  pattern: PatternType;
  badgeStyle: BadgeStyle;
  avatarBackground: AvatarBackgroundType;
  avatarRadius: number;
  
  // Visibility
  showOwner: boolean;
  showAvatar: boolean;
  
  // Stats
  showStars: boolean;
  showForks: boolean;
  showIssues: boolean;
  
  showBadges: boolean;
  
  // Customization
  bgColor: string; // Used for Solid theme or Gradient Start
  accentColor: string; // Text color or secondary gradient
  customTitle: string;
  customDescription: string;
  customLogo: string | null; // Base64 string for custom uploaded logo
}
