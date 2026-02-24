import React from 'react';
import { RotateCcw } from 'lucide-react';

interface NumberInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

export const NumberInput: React.FC<NumberInputProps> = ({ label, value, min, max, step = 1, onChange }) => (
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
      className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-sm text-zinc-800 outline-none transition-colors focus:border-indigo-500 focus:ring-0"
    />
  </label>
);

interface SliderInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

export const SliderInput: React.FC<SliderInputProps> = ({ label, value, min, max, step = 1, onChange }) => (
  <label className="space-y-1">
    <div className="flex items-center justify-between">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-xs tabular-nums text-zinc-400">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
      className="w-full accent-indigo-500"
    />
  </label>
);

interface SelectInputProps {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

export const SelectInput: React.FC<SelectInputProps> = ({ label, value, options, onChange }) => (
  <label className="space-y-1">
    <span className="text-xs text-zinc-500">{label}</span>
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-2 text-sm text-zinc-800 outline-none transition-colors focus:border-indigo-500 focus:ring-0"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);

interface SectionHeaderProps {
  title: string;
  onReset: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onReset }) => (
  <div className="flex items-center justify-between">
    <h3 className="text-sm font-semibold text-zinc-700">{title}</h3>
    <RotateCcw
      className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
      onClick={onReset}
    />
  </div>
);
