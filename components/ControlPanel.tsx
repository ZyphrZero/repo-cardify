import React from 'react';
import {
  CardConfig,
  FONT_OPTIONS,
  PATTERN_OPTIONS,
  THEME_OPTIONS,
  createDefaultCardConfig,
} from '../types';
import { useI18n } from './I18nContext';
import { SectionHeader, SelectInput, SliderInput } from './SharedInputs';

const DEFAULTS = createDefaultCardConfig();

interface ControlPanelProps {
  config: CardConfig;
  setConfig: React.Dispatch<React.SetStateAction<CardConfig>>;
  disabled: boolean;
  onExportPreset: () => void;
  onImportPreset: (file: File) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  config,
  setConfig,
  disabled,
  onExportPreset,
  onImportPreset,
}) => {
  const { messages } = useI18n();

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
      } [&>section]:rounded-xl [&>section]:p-4`}
    >
      <section className="space-y-4">
        <SectionHeader title={messages.controlPanel.sections.theme} onReset={() => setConfig((prev) => ({ ...prev, theme: DEFAULTS.theme, colors: { ...DEFAULTS.colors } }))} />
        <SelectInput
          label={messages.controlPanel.labels.themeStyle}
          value={config.theme}
          options={THEME_OPTIONS.map((option) => ({ value: option.id, label: messages.options.theme[option.id] }))}
          onChange={(value) => setConfig((prev) => ({ ...prev, theme: value as CardConfig['theme'] }))}
        />

        {config.theme === 'gradient' && (
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
        )}

        {config.theme === 'solid' && (
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
        )}
      </section>

      <section className="space-y-4">
        <SectionHeader title={messages.controlPanel.sections.typography} onReset={() => setConfig((prev) => ({ ...prev, font: DEFAULTS.font }))} />
        <SelectInput
          label={messages.controlPanel.labels.fontFamily}
          value={config.font}
          options={FONT_OPTIONS.map((font) => ({ value: font.id, label: messages.options.font[font.id] }))}
          onChange={(value) => setConfig((prev) => ({ ...prev, font: value as CardConfig['font'] }))}
        />
      </section>

      <section className="space-y-4">
        <SectionHeader title={messages.controlPanel.sections.pattern} onReset={() => setConfig((prev) => ({ ...prev, pattern: { ...DEFAULTS.pattern } }))} />
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

        <div className="space-y-3">
          <SliderInput
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
          <SliderInput
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
          <SliderInput
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
          <SliderInput
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
