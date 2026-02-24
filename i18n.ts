import type {
  AvatarShapeId,
  BadgeStyleId,
  FontId,
  LayoutBlockId,
  PatternId,
  StatsStyleId,
  StatsValueFormatId,
  ThemeId,
} from './types';

export type UiThemeMode = 'system' | 'light' | 'dark';
export type Locale = 'en' | 'zh-CN';
export type AlignAction = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
export type DistributeAxis = 'horizontal' | 'vertical';

interface LocaleMessages {
  header: {
    designWorkspace: string;
    tagline: string;
    interfaceLabel: string;
    languageLabel: string;
  };
  app: {
    repositoryWorkspace: string;
    repositoryHint: string;
    statusLoaded: string;
    statusWaiting: string;
    placeholderRepo: string;
    fetch: string;
    waitingCanvasHint: string;
    emptyCanvasHint: string;
    readyToExportHint: string;
    downloadPng: string;
    downloadJpg: string;
    downloadSvg: string;
    failedFetchRepo: string;
    failedImportPreset: string;
    failedDownload: string;
    noDescription: string;
    styleLayoutTitle: string;
    editorPanelBadge: string;
  };
  editorCanvas: {
    canvasMeta: string;
    selectedLayers: string;
    showLabels: string;
    hideLabels: string;
    instructions: string;
  };
  controlPanel: {
    sections: {
      theme: string;
      typography: string;
      pattern: string;
      avatar: string;
      stats: string;
      badges: string;
      textOverride: string;
      layout: string;
      presets: string;
    };
    labels: {
      themeStyle: string;
      background: string;
      accent: string;
      fontFamily: string;
      ownerSize: string;
      titleSize: string;
      descSize: string;
      patternType: string;
      scale: string;
      opacity: string;
      offsetX: string;
      offsetY: string;
      showAvatar: string;
      avatarShape: string;
      avatarSize: string;
      cornerRadius: string;
      customLogo: string;
      removeCustomLogo: string;
      showBadges: string;
      badgeStyle: string;
      fontSize: string;
      height: string;
      paddingX: string;
      gap: string;
      showOwner: string;
      title: string;
      description: string;
      resetLayout: string;
      selectedBlocks: string;
      multiSelectHint: string;
      primaryBlock: string;
      alignAction: string;
      distributeAction: string;
      apply: string;
      x: string;
      y: string;
      width: string;
      itemWidth: string;
      itemHeight: string;
      statsValueFormat: string;
      statsStyle: string;
      valueSize: string;
      labelSize: string;
      splitRatio: string;
      importPreset: string;
      exportPreset: string;
    };
    stats: {
      stars: string;
      forks: string;
      issues: string;
    };
  };
  popover: {
    avatar: string;
    title: string;
    description: string;
    stats: string;
    badges: string;
    resetDefault: string;
  };
  card: {
    stars: string;
    forks: string;
    issues: string;
  };
  options: {
    locale: Record<Locale, string>;
    uiThemeMode: Record<UiThemeMode, string>;
    theme: Record<ThemeId, string>;
    font: Record<FontId, string>;
    pattern: Record<PatternId, string>;
    avatarShape: Record<AvatarShapeId, string>;
    badgeStyle: Record<BadgeStyleId, string>;
    statsValueFormat: Record<StatsValueFormatId, string>;
    statsStyle: Record<StatsStyleId, string>;
    layoutBlock: Record<LayoutBlockId, string>;
    alignAction: Record<AlignAction, string>;
    distributeAxis: Record<DistributeAxis, string>;
  };
}

const MESSAGES: Record<Locale, LocaleMessages> = {
  en: {
    header: {
      designWorkspace: 'Design Workspace',
      tagline: 'GitHub Social Card Generator',
      interfaceLabel: 'Interface',
      languageLabel: 'Language',
    },
    app: {
      repositoryWorkspace: 'Repository Workspace',
      repositoryHint: 'Enter a repo URL, then drag, resize, and align elements directly on canvas.',
      statusLoaded: 'Repository loaded. You can continue editing.',
      statusWaiting: 'Waiting for repository data',
      placeholderRepo: 'owner/repository',
      fetch: 'Fetch',
      waitingCanvasHint: 'Preview canvas will be generated here after loading a repository.',
      emptyCanvasHint: 'Enter a repository to generate and edit a card.',
      readyToExportHint: 'Use drag and alignment tools, then export your final image.',
      downloadPng: 'PNG',
      downloadJpg: 'JPG',
      downloadSvg: 'SVG',
      failedFetchRepo: 'Failed to fetch repository.',
      failedImportPreset: 'Failed to import preset.',
      failedDownload: 'Failed to download image.',
      noDescription: 'No description provided.',
      styleLayoutTitle: 'Style & Layout',
      editorPanelBadge: 'Editor Panel',
    },
    editorCanvas: {
      canvasMeta: '1200 × 630 Social Card Canvas',
      selectedLayers: 'Selected layers: {count}',
      showLabels: 'Show labels',
      hideLabels: 'Hide labels',
      instructions:
        'Drag to move blocks. Ctrl/Cmd/Shift + click for multi-select. Drag corner handles to resize. Hold Shift to disable snapping.',
    },
    controlPanel: {
      sections: {
        theme: 'Theme',
        typography: 'Typography',
        pattern: 'Pattern',
        avatar: 'Avatar',
        stats: 'Stats',
        badges: 'Badges',
        textOverride: 'Text Override',
        layout: 'Layout',
        presets: 'Presets',
      },
      labels: {
        themeStyle: 'Theme Style',
        background: 'Background',
        accent: 'Accent',
        fontFamily: 'Font Family',
        ownerSize: 'Owner Size',
        titleSize: 'Title Size',
        descSize: 'Desc Size',
        patternType: 'Pattern Type',
        scale: 'Scale',
        opacity: 'Opacity',
        offsetX: 'Offset X',
        offsetY: 'Offset Y',
        showAvatar: 'Show Avatar',
        avatarShape: 'Avatar Shape',
        avatarSize: 'Avatar Size',
        cornerRadius: 'Corner Radius',
        customLogo: 'Custom Logo',
        removeCustomLogo: 'Remove Custom Logo',
        showBadges: 'Show Badges',
        badgeStyle: 'Badge Style',
        fontSize: 'Font Size',
        height: 'Height',
        paddingX: 'Padding X',
        gap: 'Gap',
        showOwner: 'Show Owner',
        title: 'Title',
        description: 'Description',
        resetLayout: 'Reset Layout',
        selectedBlocks: 'Selected blocks: {count}',
        multiSelectHint: 'Use Ctrl/Cmd/Shift + click on canvas to multi-select.',
        primaryBlock: 'Primary Block',
        alignAction: 'Align Action',
        distributeAction: 'Distribute Axis',
        apply: 'Apply',
        x: 'X',
        y: 'Y',
        width: 'Width',
        itemWidth: 'Item Width',
        itemHeight: 'Item Height',
        statsValueFormat: 'Number Format',
        statsStyle: 'Stats Style',
        valueSize: 'Value Size',
        labelSize: 'Label Size',
        splitRatio: 'Split Ratio',
        importPreset: 'Import Preset',
        exportPreset: 'Export JSON Preset',
      },
      stats: {
        stars: '星标',
        forks: '分叉',
        issues: '议题',
      },
    },
    popover: {
      avatar: 'Avatar',
      title: 'Title',
      description: 'Description',
      stats: 'Stats',
      badges: 'Badges',
      resetDefault: 'Reset to Default',
    },
    card: {
      stars: '星标',
      forks: '分叉',
      issues: '议题',
    },
    options: {
      locale: {
        en: 'English',
        'zh-CN': '简体中文',
      },
      uiThemeMode: {
        system: 'System',
        light: 'Light',
        dark: 'Dark',
      },
      theme: {
        gradient: 'Gradient',
        solid: 'Solid',
        simple: 'Simple',
        dark: 'Dark',
      },
      font: {
        inter: 'Inter',
        mono: 'JetBrains Mono',
        serif: 'Merriweather',
        poppins: 'Poppins',
        playfair: 'Playfair Display',
        oswald: 'Oswald',
      },
      pattern: {
        none: 'None',
        signal: 'Signal',
        'charlie-brown': 'Charlie Brown',
        'formal-invitation': 'Formal Invitation',
        plus: 'Plus',
        'circuit-board': 'Circuit Board',
        'overlapping-hexagons': 'Overlapping Hexagons',
        'brick-wall': 'Brick Wall',
        'floating-cogs': 'Floating Cogs',
        'diagonal-stripes': 'Diagonal Stripes',
      },
      avatarShape: {
        none: 'None',
        circle: 'Circle',
        rounded: 'Rounded',
      },
      badgeStyle: {
        pill: 'Pill',
        outline: 'Outline',
        minimal: 'Minimal',
      },
      statsValueFormat: {
        compact: 'Compact (1.2k)',
        full: 'Full (1234)',
      },
      statsStyle: {
        card: 'Glass',
        split: 'Split Badge',
      },
      layoutBlock: {
        avatar: 'Avatar',
        title: 'Title',
        description: 'Description',
        stats: 'Stats Row',
        badges: 'Badges Row',
      },
      alignAction: {
        left: 'Align Left',
        center: 'Align Center',
        right: 'Align Right',
        top: 'Align Top',
        middle: 'Align Middle',
        bottom: 'Align Bottom',
      },
      distributeAxis: {
        horizontal: 'Horizontal',
        vertical: 'Vertical',
      },
    },
  },
  'zh-CN': {
    header: {
      designWorkspace: '设计工作台',
      tagline: 'GitHub 社交卡片生成器',
      interfaceLabel: '界面主题',
      languageLabel: '语言',
    },
    app: {
      repositoryWorkspace: '仓库工作区',
      repositoryHint: '输入仓库地址后，可在画布中直接拖拽、缩放和对齐元素。',
      statusLoaded: '仓库已加载，可继续编辑。',
      statusWaiting: '等待仓库数据',
      placeholderRepo: 'owner/repository',
      fetch: '获取',
      waitingCanvasHint: '加载仓库后，这里会生成可编辑的预览画布。',
      emptyCanvasHint: '输入仓库后可生成并编辑卡片。',
      readyToExportHint: '可先用拖拽和对齐工具调整布局，再导出图片。',
      downloadPng: 'PNG',
      downloadJpg: 'JPG',
      downloadSvg: 'SVG',
      failedFetchRepo: '获取仓库失败。',
      failedImportPreset: '导入预设失败。',
      failedDownload: '下载图片失败。',
      noDescription: '暂无描述。',
      styleLayoutTitle: '样式与布局',
      editorPanelBadge: '编辑面板',
    },
    editorCanvas: {
      canvasMeta: '1200 × 630 社交卡片画布',
      selectedLayers: '已选图层：{count}',
      showLabels: '显示标签',
      hideLabels: '隐藏标签',
      instructions:
        '拖拽可移动图层。Ctrl/Cmd/Shift + 点击可多选。拖动四角手柄可缩放。按住 Shift 可临时关闭吸附。',
    },
    controlPanel: {
      sections: {
        theme: '主题',
        typography: '字体',
        pattern: '图案',
        avatar: '头像',
        stats: '统计信息',
        badges: '徽章',
        textOverride: '文本覆盖',
        layout: '布局',
        presets: '预设',
      },
      labels: {
        themeStyle: '主题样式',
        background: '背景色',
        accent: '强调色',
        fontFamily: '字体族',
        ownerSize: 'Owner 字号',
        titleSize: '标题字号',
        descSize: '描述字号',
        patternType: '图案类型',
        scale: '缩放',
        opacity: '透明度',
        offsetX: 'X 偏移',
        offsetY: 'Y 偏移',
        showAvatar: '显示头像',
        avatarShape: '头像形状',
        avatarSize: '头像尺寸',
        cornerRadius: '圆角半径',
        customLogo: '自定义 Logo',
        removeCustomLogo: '移除自定义 Logo',
        showBadges: '显示徽章',
        badgeStyle: '徽章样式',
        fontSize: '字体大小',
        height: '高度',
        paddingX: '水平内边距',
        gap: '间距',
        showOwner: '显示 Owner',
        title: '标题',
        description: '描述',
        resetLayout: '重置布局',
        selectedBlocks: '已选区块：{count}',
        multiSelectHint: '在画布中使用 Ctrl/Cmd/Shift + 点击可多选。',
        primaryBlock: '主编辑区块',
        alignAction: '对齐方式',
        distributeAction: '分布方向',
        apply: '应用',
        x: 'X',
        y: 'Y',
        width: '宽度',
        itemWidth: '单项宽度',
        itemHeight: '单项高度',
        statsValueFormat: '数字格式',
        statsStyle: '统计样式',
        valueSize: '数值大小',
        labelSize: '标签大小',
        splitRatio: '分隔比例',
        importPreset: '导入预设',
        exportPreset: '导出 JSON 预设',
      },
      stats: {
        stars: 'Stars',
        forks: 'Forks',
        issues: 'Issues',
      },
    },
    popover: {
      avatar: '头像',
      title: '标题',
      description: '描述',
      stats: '统计',
      badges: '徽章',
      resetDefault: '还原默认',
    },
    card: {
      stars: 'Stars',
      forks: 'Forks',
      issues: 'Issues',
    },
    options: {
      locale: {
        en: 'English',
        'zh-CN': '简体中文',
      },
      uiThemeMode: {
        system: '跟随系统',
        light: '浅色',
        dark: '深色',
      },
      theme: {
        gradient: '渐变',
        solid: '纯色',
        simple: '白色',
        dark: '深色',
      },
      font: {
        inter: 'Inter',
        mono: 'JetBrains Mono',
        serif: 'Merriweather',
        poppins: 'Poppins',
        playfair: 'Playfair Display',
        oswald: 'Oswald',
      },
      pattern: {
        none: '无',
        signal: '信号',
        'charlie-brown': 'Charlie Brown',
        'formal-invitation': 'Formal Invitation',
        plus: '加号',
        'circuit-board': '电路板',
        'overlapping-hexagons': '重叠六边形',
        'brick-wall': '砖墙',
        'floating-cogs': '浮动齿轮',
        'diagonal-stripes': '斜条纹',
      },
      avatarShape: {
        none: '无',
        circle: '圆形',
        rounded: '圆角',
      },
      badgeStyle: {
        pill: '胶囊',
        outline: '描边',
        minimal: '极简',
      },
      statsValueFormat: {
        compact: '简写 (1.2k)',
        full: '完整 (1234)',
      },
      statsStyle: {
        card: '高级玻璃',
        split: '分段徽章',
      },
      layoutBlock: {
        avatar: '头像',
        title: '标题',
        description: '描述',
        stats: '统计行',
        badges: '徽章行',
      },
      alignAction: {
        left: '左对齐',
        center: '水平居中',
        right: '右对齐',
        top: '顶对齐',
        middle: '垂直居中',
        bottom: '底对齐',
      },
      distributeAxis: {
        horizontal: '水平分布',
        vertical: '垂直分布',
      },
    },
  },
};

export const isLocale = (value: string): value is Locale => value === 'en' || value === 'zh-CN';

export const detectLocale = (language: string): Locale => (language.toLowerCase().startsWith('zh') ? 'zh-CN' : 'en');

export const getLocaleMessages = (locale: Locale): LocaleMessages => MESSAGES[locale];

export type { LocaleMessages };
