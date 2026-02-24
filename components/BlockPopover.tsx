import React, { useEffect, useRef } from 'react';
import {
  AVATAR_SHAPE_OPTIONS,
  BADGE_STYLE_OPTIONS,
  CardConfig,
  LayoutBlockId,
  createDefaultCardConfig,
} from '../types';
import { useI18n } from './I18nContext';
import { NumberInput, SectionHeader, SelectInput } from './SharedInputs';

interface BlockPopoverProps {
  block: LayoutBlockId;
  anchor: DOMRect;
  config: CardConfig;
  setConfig: React.Dispatch<React.SetStateAction<CardConfig>>;
  onClose: () => void;
  onLogoUpload: (file: File) => void;
}

const POPOVER_WIDTH = 260;
const POPOVER_GAP = 8;

const computePosition = (anchor: DOMRect, popoverHeight: number) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left: number;
  let top: number;

  // Try right side of anchor
  if (anchor.right + POPOVER_GAP + POPOVER_WIDTH <= vw) {
    left = anchor.right + POPOVER_GAP;
  }
  // Try left side of anchor
  else if (anchor.left - POPOVER_GAP - POPOVER_WIDTH >= 0) {
    left = anchor.left - POPOVER_GAP - POPOVER_WIDTH;
  }
  // Fallback: below anchor
  else {
    left = Math.max(4, Math.min(anchor.left, vw - POPOVER_WIDTH - 4));
    top = anchor.bottom + POPOVER_GAP;
    top = Math.max(4, Math.min(top, vh - popoverHeight - 4));
    return { left, top };
  }

  // Vertical: align top of popover with top of anchor, clamped to viewport
  top = anchor.top;
  top = Math.max(4, Math.min(top, vh - popoverHeight - 4));

  return { left, top };
};

const DEFAULTS = createDefaultCardConfig();

const AvatarContent: React.FC<{ config: CardConfig; setConfig: React.Dispatch<React.SetStateAction<CardConfig>>; messages: ReturnType<typeof useI18n>['messages']; onLogoUpload: (file: File) => void }> = ({ config, setConfig, messages, onLogoUpload }) => (
  <div className="space-y-3">
    <label className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2">
      <span className="text-xs text-zinc-600">{messages.controlPanel.labels.showAvatar}</span>
      <input
        type="checkbox"
        checked={config.avatar.visible}
        onChange={(e) => setConfig((prev) => ({ ...prev, avatar: { ...prev.avatar, visible: e.target.checked } }))}
        className="h-4 w-4 rounded border-zinc-300 bg-white"
      />
    </label>
    <SelectInput
      label={messages.controlPanel.labels.avatarShape}
      value={config.avatar.shape}
      options={AVATAR_SHAPE_OPTIONS.map((s) => ({ value: s.id, label: messages.options.avatarShape[s.id] }))}
      onChange={(v) => setConfig((prev) => ({ ...prev, avatar: { ...prev.avatar, shape: v as CardConfig['avatar']['shape'] } }))}
    />
    <NumberInput
      label={messages.controlPanel.labels.avatarSize}
      value={config.avatar.size}
      min={40}
      max={260}
      onChange={(v) =>
        setConfig((prev) => ({
          ...prev,
          avatar: { ...prev.avatar, size: v },
          layout: { ...prev.layout, avatar: { ...prev.layout.avatar, w: v, h: v } },
        }))
      }
    />
    <NumberInput
      label={messages.controlPanel.labels.cornerRadius}
      value={config.avatar.radius}
      min={0}
      max={130}
      onChange={(v) => setConfig((prev) => ({ ...prev, avatar: { ...prev.avatar, radius: v } }))}
    />
    <label className="space-y-1 block">
      <span className="text-xs text-zinc-500">{messages.controlPanel.labels.customLogo}</span>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) { onLogoUpload(f); e.target.value = ''; } }}
        className="w-full text-sm text-zinc-500 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-zinc-700 hover:file:bg-zinc-200"
      />
    </label>
    {config.customLogo && (
      <button
        type="button"
        onClick={() => setConfig((prev) => ({ ...prev, customLogo: null }))}
        className="rounded-md border border-red-700/70 px-3 py-1.5 text-xs text-red-300 hover:bg-red-900/30"
      >
        {messages.controlPanel.labels.removeCustomLogo}
      </button>
    )}
  </div>
);

const TitleContent: React.FC<{ config: CardConfig; setConfig: React.Dispatch<React.SetStateAction<CardConfig>>; messages: ReturnType<typeof useI18n>['messages']; onLogoUpload: (file: File) => void }> = ({ config, setConfig, messages }) => (
  <div className="space-y-3">
    <label className="space-y-1 block">
      <span className="text-xs text-zinc-500">{messages.controlPanel.labels.title}</span>
      <input
        type="text"
        value={config.text.customTitle}
        onChange={(e) => setConfig((prev) => ({ ...prev, text: { ...prev.text, customTitle: e.target.value } }))}
        className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-sm text-zinc-800 outline-none transition-colors focus:border-indigo-500 focus:ring-0"
      />
    </label>
    <NumberInput
      label={messages.controlPanel.labels.titleSize}
      value={config.text.titleSize}
      min={24}
      max={120}
      onChange={(v) => setConfig((prev) => ({ ...prev, text: { ...prev.text, titleSize: v } }))}
    />
    <label className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2">
      <span className="text-xs text-zinc-600">{messages.controlPanel.labels.showOwner}</span>
      <input
        type="checkbox"
        checked={config.text.showOwner}
        onChange={(e) => setConfig((prev) => ({ ...prev, text: { ...prev.text, showOwner: e.target.checked } }))}
        className="h-4 w-4 rounded border-zinc-300 bg-white"
      />
    </label>
    <NumberInput
      label={messages.controlPanel.labels.ownerSize}
      value={config.text.ownerSize}
      min={14}
      max={64}
      onChange={(v) => setConfig((prev) => ({ ...prev, text: { ...prev.text, ownerSize: v } }))}
    />
  </div>
);

const DescriptionContent: React.FC<{ config: CardConfig; setConfig: React.Dispatch<React.SetStateAction<CardConfig>>; messages: ReturnType<typeof useI18n>['messages']; onLogoUpload: (file: File) => void }> = ({ config, setConfig, messages }) => (
  <div className="space-y-3">
    <label className="space-y-1 block">
      <span className="text-xs text-zinc-500">{messages.controlPanel.labels.description}</span>
      <textarea
        value={config.text.customDescription}
        onChange={(e) => setConfig((prev) => ({ ...prev, text: { ...prev.text, customDescription: e.target.value } }))}
        rows={2}
        className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-sm text-zinc-800 outline-none transition-colors focus:border-indigo-500 focus:ring-0"
      />
    </label>
    <NumberInput
      label={messages.controlPanel.labels.descSize}
      value={config.text.descriptionSize}
      min={14}
      max={72}
      onChange={(v) => setConfig((prev) => ({ ...prev, text: { ...prev.text, descriptionSize: v } }))}
    />
  </div>
);

const StatsContent: React.FC<{ config: CardConfig; setConfig: React.Dispatch<React.SetStateAction<CardConfig>>; messages: ReturnType<typeof useI18n>['messages']; onLogoUpload: (file: File) => void }> = ({ config, setConfig, messages }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-3 gap-2">
      {([
        { key: 'showStars' as const, label: messages.controlPanel.stats.stars },
        { key: 'showForks' as const, label: messages.controlPanel.stats.forks },
        { key: 'showIssues' as const, label: messages.controlPanel.stats.issues },
      ]).map((item) => (
        <label key={item.key} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-2 py-1.5">
          <span className="text-[11px] text-zinc-600">{item.label}</span>
          <input
            type="checkbox"
            checked={config.stats[item.key]}
            onChange={(e) => setConfig((prev) => ({ ...prev, stats: { ...prev.stats, [item.key]: e.target.checked } }))}
            className="h-3.5 w-3.5 rounded border-zinc-300 bg-white"
          />
        </label>
      ))}
    </div>
    <NumberInput
      label={messages.controlPanel.labels.gap}
      value={config.stats.gap}
      min={0}
      max={80}
      onChange={(v) => setConfig((prev) => ({ ...prev, stats: { ...prev.stats, gap: v } }))}
    />
    <NumberInput
      label={messages.controlPanel.labels.itemWidth}
      value={config.stats.itemWidth}
      min={80}
      max={260}
      onChange={(v) => setConfig((prev) => ({ ...prev, stats: { ...prev.stats, itemWidth: v } }))}
    />
    <NumberInput
      label={messages.controlPanel.labels.itemHeight}
      value={config.stats.itemHeight}
      min={40}
      max={120}
      onChange={(v) => setConfig((prev) => ({ ...prev, stats: { ...prev.stats, itemHeight: v } }))}
    />
  </div>
);

const BadgesContent: React.FC<{ config: CardConfig; setConfig: React.Dispatch<React.SetStateAction<CardConfig>>; messages: ReturnType<typeof useI18n>['messages']; onLogoUpload: (file: File) => void }> = ({ config, setConfig, messages }) => (
  <div className="space-y-3">
    <label className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2">
      <span className="text-xs text-zinc-600">{messages.controlPanel.labels.showBadges}</span>
      <input
        type="checkbox"
        checked={config.badge.visible}
        onChange={(e) => setConfig((prev) => ({ ...prev, badge: { ...prev.badge, visible: e.target.checked } }))}
        className="h-4 w-4 rounded border-zinc-300 bg-white"
      />
    </label>
    <SelectInput
      label={messages.controlPanel.labels.badgeStyle}
      value={config.badge.style}
      options={BADGE_STYLE_OPTIONS.map((s) => ({ value: s.id, label: messages.options.badgeStyle[s.id] }))}
      onChange={(v) => setConfig((prev) => ({ ...prev, badge: { ...prev.badge, style: v as CardConfig['badge']['style'] } }))}
    />
    <NumberInput
      label={messages.controlPanel.labels.fontSize}
      value={config.badge.fontSize}
      min={10}
      max={40}
      onChange={(v) => setConfig((prev) => ({ ...prev, badge: { ...prev.badge, fontSize: v } }))}
    />
    <NumberInput
      label={messages.controlPanel.labels.height}
      value={config.badge.height}
      min={24}
      max={80}
      onChange={(v) => setConfig((prev) => ({ ...prev, badge: { ...prev.badge, height: v } }))}
    />
    <NumberInput
      label={messages.controlPanel.labels.paddingX}
      value={config.badge.paddingX}
      min={4}
      max={40}
      onChange={(v) => setConfig((prev) => ({ ...prev, badge: { ...prev.badge, paddingX: v } }))}
    />
    <NumberInput
      label={messages.controlPanel.labels.gap}
      value={config.badge.gap}
      min={0}
      max={60}
      onChange={(v) => setConfig((prev) => ({ ...prev, badge: { ...prev.badge, gap: v } }))}
    />
  </div>
);

const BLOCK_CONTENT: Record<LayoutBlockId, React.FC<{ config: CardConfig; setConfig: React.Dispatch<React.SetStateAction<CardConfig>>; messages: ReturnType<typeof useI18n>['messages']; onLogoUpload: (file: File) => void }>> = {
  avatar: AvatarContent,
  title: TitleContent,
  description: DescriptionContent,
  stats: StatsContent,
  badges: BadgesContent,
};

export const BlockPopover: React.FC<BlockPopoverProps> = ({
  block,
  anchor,
  config,
  setConfig,
  onClose,
  onLogoUpload,
}) => {
  const { messages } = useI18n();
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Close on outside click
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  // Measure and position
  const [pos, setPos] = React.useState<{ left: number; top: number } | null>(null);

  useEffect(() => {
    if (!popoverRef.current) return;
    const height = popoverRef.current.offsetHeight;
    setPos(computePosition(anchor, height));
  }, [anchor, block]);

  const Content = BLOCK_CONTENT[block];

  const resetHandlers: Record<LayoutBlockId, () => void> = {
    avatar: () => setConfig((prev) => ({
      ...prev,
      avatar: { ...DEFAULTS.avatar },
      customLogo: null,
      layout: { ...prev.layout, avatar: { ...DEFAULTS.layout.avatar } },
    })),
    title: () => setConfig((prev) => ({
      ...prev,
      text: { ...prev.text, titleSize: DEFAULTS.text.titleSize, showOwner: DEFAULTS.text.showOwner, ownerSize: DEFAULTS.text.ownerSize },
      layout: { ...prev.layout, title: { ...DEFAULTS.layout.title } },
    })),
    description: () => setConfig((prev) => ({
      ...prev,
      text: { ...prev.text, descriptionSize: DEFAULTS.text.descriptionSize },
      layout: { ...prev.layout, description: { ...DEFAULTS.layout.description } },
    })),
    stats: () => setConfig((prev) => ({
      ...prev,
      stats: { ...DEFAULTS.stats },
      layout: { ...prev.layout, stats: { ...DEFAULTS.layout.stats } },
    })),
    badges: () => setConfig((prev) => ({
      ...prev,
      badge: { ...DEFAULTS.badge },
      layout: { ...prev.layout, badges: { ...DEFAULTS.layout.badges } },
    })),
  };

  return (
    <div
      ref={popoverRef}
      className="app-card fixed z-50 rounded-xl shadow-lg overflow-hidden"
      style={{
        width: POPOVER_WIDTH,
        left: pos?.left ?? -9999,
        top: pos?.top ?? -9999,
        opacity: pos ? 1 : 0,
        transition: 'opacity 0.12s ease',
      }}
    >
      <div className="border-b border-zinc-100 px-3 py-2">
        <SectionHeader title={messages.popover[block]} onReset={resetHandlers[block]} />
      </div>
      <div className="p-3">
        <Content config={config} setConfig={setConfig} messages={messages} onLogoUpload={onLogoUpload} />
      </div>
    </div>
  );
};
