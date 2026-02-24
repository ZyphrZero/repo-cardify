import React from 'react';
import {
  AVATAR_SHAPE_OPTIONS,
  BADGE_STYLE_OPTIONS,
  CardConfig,
  FONT_OPTIONS,
  LayoutBlockId,
  PATTERN_OPTIONS,
  THEME_OPTIONS,
} from '../types';
import { useI18n } from './I18nContext';
import { AlignAction, DistributeAxis } from './layoutTransforms';

interface ControlPanelProps {
  config: CardConfig;
  setConfig: React.Dispatch<React.SetStateAction<CardConfig>>;
  onLogoUpload: (file: File) => void;
  disabled: boolean;
  selectedBlocks: LayoutBlockId[];
  primaryBlock: LayoutBlockId;
  setSelection: (blocks: LayoutBlockId[], primary?: LayoutBlockId) => void;
  onResetLayout: () => void;
  onAlign: (action: AlignAction) => void;
  onDistribute: (axis: DistributeAxis) => void;
  onExportPreset: () => void;
  onImportPreset: (file: File) => void;
}

interface NumberInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

const NumberInput: React.FC<NumberInputProps> = ({ label, value, min, max, step = 1, onChange }) => (
  <label className="space-y-1">
    <span className="text-xs text-zinc-500">{label}</span>
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => {
        const next = Number(event.target.value);
        if (Number.isFinite(next)) {
          onChange(next);
        }
      }}
      className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-sm text-zinc-800 outline-none focus:border-indigo-500"
    />
  </label>
);

interface SelectInputProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

const SelectInput: React.FC<SelectInputProps> = ({ label, value, options, onChange }) => (
  <label className="space-y-1">
    <span className="text-xs text-zinc-500">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-sm text-zinc-800 outline-none focus:border-indigo-500"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

const BLOCK_ORDER: LayoutBlockId[] = ['avatar', 'title', 'description', 'stats', 'badges'];

const ALIGN_ACTIONS: AlignAction[] = ['left', 'center', 'right', 'top', 'middle', 'bottom'];

const DISTRIBUTE_OPTIONS: DistributeAxis[] = ['horizontal', 'vertical'];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  setConfig,
  onLogoUpload,
  disabled,
  selectedBlocks,
  primaryBlock,
  setSelection,
  onResetLayout,
  onAlign,
  onDistribute,
  onExportPreset,
  onImportPreset,
}) => {
  const { messages } = useI18n();
  const [alignAction, setAlignAction] = React.useState<AlignAction>('left');
  const [distributeAxis, setDistributeAxis] = React.useState<DistributeAxis>('horizontal');

  const updateLayout = (block: LayoutBlockId, patch: Partial<{ x: number; y: number; w: number; h: number }>) => {
    setConfig((prev) => ({
      ...prev,
      layout: {
        ...prev.layout,
        [block]: {
          ...prev.layout[block],
          ...patch,
        },
      },
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onLogoUpload(file);
    event.target.value = '';
  };

  const handlePresetImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    onImportPreset(file);
    event.target.value = '';
  };

  return (
    <div
      className={`control-panel space-y-4 ${
        disabled ? 'pointer-events-none opacity-50' : ''
      } [&>section]:rounded-xl [&>section]:bg-zinc-50 [&>section]:p-4`}
    >
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-700">{messages.controlPanel.sections.theme}</h3>
        <SelectInput
          label={messages.controlPanel.labels.themeStyle}
          value={config.theme}
          options={THEME_OPTIONS.map((option) => ({ value: option.id, label: messages.options.theme[option.id] }))}
          onChange={(value) => setConfig((prev) => ({ ...prev, theme: value as CardConfig['theme'] }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs text-zinc-500">{messages.controlPanel.labels.background}</span>
            <input
              type="color"
              value={config.colors.background}
              onChange={(event) =>
                setConfig((prev) => ({
                  ...prev,
                  colors: { ...prev.colors, background: event.target.value },
                }))
              }
              className="h-9 w-full rounded border border-zinc-200 bg-white p-1"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs text-zinc-500">{messages.controlPanel.labels.accent}</span>
            <input
              type="color"
              value={config.colors.accent}
              onChange={(event) =>
                setConfig((prev) => ({
                  ...prev,
                  colors: { ...prev.colors, accent: event.target.value },
                }))
              }
              className="h-9 w-full rounded border border-zinc-200 bg-white p-1"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-700">{messages.controlPanel.sections.typography}</h3>
        <SelectInput
          label={messages.controlPanel.labels.fontFamily}
          value={config.font}
          options={FONT_OPTIONS.map((font) => ({ value: font.id, label: messages.options.font[font.id] }))}
          onChange={(value) => setConfig((prev) => ({ ...prev, font: value as CardConfig['font'] }))}
        />

        <div className="grid grid-cols-3 gap-3">
          <NumberInput
            label={messages.controlPanel.labels.ownerSize}
            value={config.text.ownerSize}
            min={14}
            max={64}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                text: { ...prev.text, ownerSize: value },
              }))
            }
          />
          <NumberInput
            label={messages.controlPanel.labels.titleSize}
            value={config.text.titleSize}
            min={24}
            max={120}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                text: { ...prev.text, titleSize: value },
              }))
            }
          />
          <NumberInput
            label={messages.controlPanel.labels.descSize}
            value={config.text.descriptionSize}
            min={14}
            max={72}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                text: { ...prev.text, descriptionSize: value },
              }))
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-700">{messages.controlPanel.sections.pattern}</h3>
        <SelectInput
          label={messages.controlPanel.labels.patternType}
          value={config.pattern.id}
          options={PATTERN_OPTIONS.map((pattern) => ({ value: pattern.id, label: messages.options.pattern[pattern.id] }))}
          onChange={(value) =>
            setConfig((prev) => ({
              ...prev,
              pattern: { ...prev.pattern, id: value as CardConfig['pattern']['id'] },
            }))
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label={messages.controlPanel.labels.scale}
            value={config.pattern.scale}
            min={0.5}
            max={4}
            step={0.1}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                pattern: { ...prev.pattern, scale: value },
              }))
            }
          />
          <NumberInput
            label={messages.controlPanel.labels.opacity}
            value={config.pattern.opacity}
            min={0.05}
            max={0.95}
            step={0.05}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                pattern: { ...prev.pattern, opacity: value },
              }))
            }
          />
          <NumberInput
            label={messages.controlPanel.labels.offsetX}
            value={config.pattern.offsetX}
            min={-400}
            max={400}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                pattern: { ...prev.pattern, offsetX: value },
              }))
            }
          />
          <NumberInput
            label={messages.controlPanel.labels.offsetY}
            value={config.pattern.offsetY}
            min={-300}
            max={300}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                pattern: { ...prev.pattern, offsetY: value },
              }))
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-700">{messages.controlPanel.sections.avatar}</h3>
        <label className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2">
          <span className="text-xs text-zinc-600">{messages.controlPanel.labels.showAvatar}</span>
          <input
            type="checkbox"
            checked={config.avatar.visible}
            onChange={(event) =>
              setConfig((prev) => ({
                ...prev,
                avatar: { ...prev.avatar, visible: event.target.checked },
              }))
            }
            className="h-4 w-4 rounded border-zinc-300 bg-white"
          />
        </label>

        <SelectInput
          label={messages.controlPanel.labels.avatarShape}
          value={config.avatar.shape}
          options={AVATAR_SHAPE_OPTIONS.map((shape) => ({ value: shape.id, label: messages.options.avatarShape[shape.id] }))}
          onChange={(value) =>
            setConfig((prev) => ({
              ...prev,
              avatar: { ...prev.avatar, shape: value as CardConfig['avatar']['shape'] },
            }))
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label={messages.controlPanel.labels.avatarSize}
            value={config.avatar.size}
            min={40}
            max={260}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                avatar: { ...prev.avatar, size: value },
                layout: {
                  ...prev.layout,
                  avatar: {
                    ...prev.layout.avatar,
                    w: value,
                    h: value,
                  },
                },
              }))
            }
          />
          <NumberInput
            label={messages.controlPanel.labels.cornerRadius}
            value={config.avatar.radius}
            min={0}
            max={130}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                avatar: { ...prev.avatar, radius: value },
              }))
            }
          />
        </div>

        <label className="space-y-1 block">
          <span className="text-xs text-zinc-500">{messages.controlPanel.labels.customLogo}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
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
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-700">{messages.controlPanel.sections.stats}</h3>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'showStars' as const, label: messages.controlPanel.stats.stars },
            { key: 'showForks' as const, label: messages.controlPanel.stats.forks },
            { key: 'showIssues' as const, label: messages.controlPanel.stats.issues },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-2 py-1.5">
              <span className="text-xs text-zinc-600">{item.label}</span>
              <input
                type="checkbox"
                checked={config.stats[item.key]}
                onChange={(event) =>
                  setConfig((prev) => ({
                    ...prev,
                    stats: {
                      ...prev.stats,
                      [item.key]: event.target.checked,
                    },
                  }))
                }
                className="h-4 w-4 rounded border-zinc-300 bg-white"
              />
            </label>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <NumberInput
            label={messages.controlPanel.labels.itemWidth}
            value={config.stats.itemWidth}
            min={80}
            max={260}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                stats: { ...prev.stats, itemWidth: value },
              }))
            }
          />
          <NumberInput
            label={messages.controlPanel.labels.itemHeight}
            value={config.stats.itemHeight}
            min={40}
            max={120}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                stats: { ...prev.stats, itemHeight: value },
              }))
            }
          />
          <NumberInput
            label={messages.controlPanel.labels.gap}
            value={config.stats.gap}
            min={0}
            max={80}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                stats: { ...prev.stats, gap: value },
              }))
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-700">{messages.controlPanel.sections.badges}</h3>
        <label className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2">
          <span className="text-xs text-zinc-600">{messages.controlPanel.labels.showBadges}</span>
          <input
            type="checkbox"
            checked={config.badge.visible}
            onChange={(event) =>
              setConfig((prev) => ({
                ...prev,
                badge: { ...prev.badge, visible: event.target.checked },
              }))
            }
            className="h-4 w-4 rounded border-zinc-300 bg-white"
          />
        </label>

        <SelectInput
          label={messages.controlPanel.labels.badgeStyle}
          value={config.badge.style}
          options={BADGE_STYLE_OPTIONS.map((style) => ({ value: style.id, label: messages.options.badgeStyle[style.id] }))}
          onChange={(value) =>
            setConfig((prev) => ({
              ...prev,
              badge: { ...prev.badge, style: value as CardConfig['badge']['style'] },
            }))
          }
        />

        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label={messages.controlPanel.labels.fontSize}
            value={config.badge.fontSize}
            min={10}
            max={40}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                badge: { ...prev.badge, fontSize: value },
              }))
            }
          />
          <NumberInput
            label={messages.controlPanel.labels.height}
            value={config.badge.height}
            min={24}
            max={80}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                badge: { ...prev.badge, height: value },
              }))
            }
          />
          <NumberInput
            label={messages.controlPanel.labels.paddingX}
            value={config.badge.paddingX}
            min={4}
            max={40}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                badge: { ...prev.badge, paddingX: value },
              }))
            }
          />
          <NumberInput
            label={messages.controlPanel.labels.gap}
            value={config.badge.gap}
            min={0}
            max={60}
            onChange={(value) =>
              setConfig((prev) => ({
                ...prev,
                badge: { ...prev.badge, gap: value },
              }))
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-700">{messages.controlPanel.sections.textOverride}</h3>
        <label className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2">
          <span className="text-xs text-zinc-600">{messages.controlPanel.labels.showOwner}</span>
          <input
            type="checkbox"
            checked={config.text.showOwner}
            onChange={(event) =>
              setConfig((prev) => ({
                ...prev,
                text: { ...prev.text, showOwner: event.target.checked },
              }))
            }
            className="h-4 w-4 rounded border-zinc-300 bg-white"
          />
        </label>

        <label className="space-y-1 block">
          <span className="text-xs text-zinc-500">{messages.controlPanel.labels.title}</span>
          <input
            type="text"
            value={config.text.customTitle}
            onChange={(event) =>
              setConfig((prev) => ({
                ...prev,
                text: { ...prev.text, customTitle: event.target.value },
              }))
            }
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-indigo-500"
          />
        </label>

        <label className="space-y-1 block">
          <span className="text-xs text-zinc-500">{messages.controlPanel.labels.description}</span>
          <textarea
            value={config.text.customDescription}
            onChange={(event) =>
              setConfig((prev) => ({
                ...prev,
                text: { ...prev.text, customDescription: event.target.value },
              }))
            }
            rows={3}
            className="w-full resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-indigo-500"
          />
        </label>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-700">{messages.controlPanel.sections.layout}</h3>
          <button
            type="button"
            onClick={onResetLayout}
            className="rounded border border-zinc-200 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100"
          >
            {messages.controlPanel.labels.resetLayout}
          </button>
        </div>

        <p className="text-xs text-zinc-500">
          {messages.controlPanel.labels.selectedBlocks.replace('{count}', String(selectedBlocks.length))}
        </p>
        <p className="text-xs text-zinc-500">{messages.controlPanel.labels.multiSelectHint}</p>

        <SelectInput
          label={messages.controlPanel.labels.primaryBlock}
          value={primaryBlock}
          options={BLOCK_ORDER.map((block) => ({ value: block, label: messages.options.layoutBlock[block] }))}
          onChange={(value) => {
            const block = value as LayoutBlockId;
            const nextSelection = selectedBlocks.includes(block) ? selectedBlocks : [...selectedBlocks, block];
            setSelection(nextSelection, block);
          }}
        />

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <SelectInput
            label={messages.controlPanel.labels.alignAction}
            value={alignAction}
            options={ALIGN_ACTIONS.map((action) => ({ value: action, label: messages.options.alignAction[action] }))}
            onChange={(value) => setAlignAction(value as AlignAction)}
          />
          <button
            type="button"
            disabled={selectedBlocks.length < 2}
            onClick={() => onAlign(alignAction)}
            className="mt-[22px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {messages.controlPanel.labels.apply}
          </button>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <SelectInput
            label={messages.controlPanel.labels.distributeAction}
            value={distributeAxis}
            options={DISTRIBUTE_OPTIONS.map((axis) => ({ value: axis, label: messages.options.distributeAxis[axis] }))}
            onChange={(value) => setDistributeAxis(value as DistributeAxis)}
          />
          <button
            type="button"
            disabled={selectedBlocks.length < 3}
            onClick={() => onDistribute(distributeAxis)}
            className="mt-[22px] rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-600 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {messages.controlPanel.labels.apply}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label={messages.controlPanel.labels.x}
            value={config.layout[primaryBlock].x}
            min={0}
            max={1200}
            onChange={(value) => updateLayout(primaryBlock, { x: value })}
          />
          <NumberInput
            label={messages.controlPanel.labels.y}
            value={config.layout[primaryBlock].y}
            min={0}
            max={630}
            onChange={(value) => updateLayout(primaryBlock, { y: value })}
          />
        </div>

        {(primaryBlock === 'title' || primaryBlock === 'description') && (
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label={messages.controlPanel.labels.width}
              value={config.layout[primaryBlock].w}
              min={100}
              max={1200}
              onChange={(value) => updateLayout(primaryBlock, { w: value })}
            />
            <NumberInput
              label={messages.controlPanel.labels.height}
              value={config.layout[primaryBlock].h}
              min={40}
              max={400}
              onChange={(value) => updateLayout(primaryBlock, { h: value })}
            />
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-700">{messages.controlPanel.sections.presets}</h3>
        <button
          type="button"
          onClick={onExportPreset}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          {messages.controlPanel.labels.exportPreset}
        </button>

        <label className="block">
          <span className="mb-1 block text-xs text-zinc-500">{messages.controlPanel.labels.importPreset}</span>
          <input
            type="file"
            accept="application/json,.json"
            onChange={handlePresetImport}
            className="w-full text-sm text-zinc-500 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-zinc-700 hover:file:bg-zinc-200"
          />
        </label>
      </section>
    </div>
  );
};
