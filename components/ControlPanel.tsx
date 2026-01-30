import React from 'react';
import { CardConfig, ThemeType, FontType, PatternType, BadgeStyle, AvatarBackgroundType } from '../types';
import { Palette, Type, Grid, Layout, Eye, Upload, Tag } from 'lucide-react';

interface ControlPanelProps {
  config: CardConfig;
  setConfig: React.Dispatch<React.SetStateAction<CardConfig>>;
  onLogoUpload: (file: File) => void;
  disabled: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ config, setConfig, onLogoUpload, disabled }) => {
  
  const handleChange = (key: keyof CardConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onLogoUpload(e.target.files[0]);
      // Reset input value so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  return (
    <div className={`space-y-8 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      
      {/* Theme Section */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Palette className="w-4 h-4 text-indigo-400" />
          Theme Style
        </label>
        <div className="grid grid-cols-2 gap-2">
           {(Object.keys(ThemeType) as Array<keyof typeof ThemeType>).map((t) => (
             <button
               key={t}
               onClick={() => handleChange('theme', ThemeType[t])}
               className={`p-3 rounded-lg text-sm border transition-all ${
                 config.theme === ThemeType[t] 
                   ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/50' 
                   : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
               }`}
             >
               {t}
             </button>
           ))}
        </div>
      </div>

       {/* Color Picker */}
       <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
           Theme Color
        </label>
        <div className="flex gap-4 items-center">
            <input 
                type="color" 
                value={config.bgColor}
                onChange={(e) => handleChange('bgColor', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer bg-transparent border-none"
            />
            <span className="text-xs text-zinc-500 uppercase">{config.bgColor}</span>
        </div>
      </div>

      {/* Font Section */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Type className="w-4 h-4 text-pink-400" />
          Typography
        </label>
        <div className="grid grid-cols-2 gap-2">
           {Object.values(FontType).map((f) => (
             <button
               key={f}
               onClick={() => handleChange('font', f)}
               className={`p-2 rounded-lg text-xs border text-center transition-all ${
                 config.font === f
                   ? 'bg-zinc-800 border-pink-500 text-white' 
                   : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
               }`}
               style={{ fontFamily: f.includes('Mono') ? 'monospace' : f.includes('Serif') ? 'serif' : 'sans-serif' }}
             >
               {f.split(' ')[0]}
             </button>
           ))}
        </div>
      </div>

      {/* Pattern Section */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Grid className="w-4 h-4 text-emerald-400" />
          Background Pattern
        </label>
        <div className="flex flex-wrap gap-2">
           {[
             PatternType.None,
             PatternType.Signal,
             PatternType.CharlieBrown,
             PatternType.FormalInvitation,
             PatternType.Plus,
             PatternType.CircuitBoard,
             PatternType.OverlappingHexagons,
             PatternType.BrickWall,
             PatternType.FloatingCogs,
             PatternType.DiagonalStripes,
           ].map((pattern) => (
             <button
               key={pattern}
               onClick={() => handleChange('pattern', pattern)}
               className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                 config.pattern === pattern
                   ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400' 
                   : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-700'
               }`}
             >
               {pattern}
             </button>
           ))}
        </div>
      </div>

      {/* Custom Logo Upload */}
      <div className="space-y-4">
         <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
            <Upload className="w-4 h-4 text-cyan-400" />
            Custom Project Logo
         </label>
         <div className="relative">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-300 hover:file:bg-zinc-700"
            />
            {config.customLogo && (
               <button 
                 onClick={() => handleChange('customLogo', null)}
                 className="absolute right-0 top-0 text-xs text-red-400 hover:text-red-300 py-2 px-3"
               >
                 Remove
               </button>
            )}
         </div>
      </div>

      {/* Avatar Background */}
      <div className="space-y-4">
         <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
            Avatar Background
         </label>
         <div className="grid grid-cols-3 gap-2">
            {[
              AvatarBackgroundType.None,
              AvatarBackgroundType.Circle,
              AvatarBackgroundType.Rounded,
            ].map((type) => (
               <button
                 key={type}
                 onClick={() => handleChange('avatarBackground', type)}
                 className={`px-2 py-1.5 rounded text-xs border transition-all ${
                    config.avatarBackground === type
                    ? 'bg-cyan-900/30 border-cyan-500 text-cyan-200'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                 }`}
               >
                 {type}
               </button>
            ))}
         </div>
         {config.avatarBackground === AvatarBackgroundType.Rounded && (
           <div className="space-y-2">
             <div className="flex items-center justify-between text-xs text-zinc-500">
               <span>Corner Radius</span>
               <span>{Math.round(config.avatarRadius)}px</span>
             </div>
             <input
               type="range"
               min={0}
               max={60}
               value={config.avatarRadius}
               onChange={(e) => handleChange('avatarRadius', Number(e.target.value))}
               className="w-full"
             />
           </div>
         )}
      </div>

      {/* Badge Styles */}
      <div className="space-y-4">
         <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
            <Tag className="w-4 h-4 text-orange-400" />
            Language Badges
         </label>
         <div className="grid grid-cols-3 gap-2">
            {Object.values(BadgeStyle).map((b) => (
               <button
                 key={b}
                 onClick={() => handleChange('badgeStyle', b)}
                 className={`px-2 py-1.5 rounded text-xs border transition-all ${
                    config.badgeStyle === b
                    ? 'bg-orange-900/30 border-orange-500 text-orange-200'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                 }`}
               >
                 {b}
               </button>
            ))}
         </div>
      </div>

      {/* Visibility Toggles */}
      <div className="space-y-4">
        <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Eye className="w-4 h-4 text-amber-400" />
          Visibility
        </label>
        <div className="grid grid-cols-2 gap-2">
           {[
             { key: 'showOwner', label: 'Owner Name' },
             { key: 'showAvatar', label: 'Avatar' },
             { key: 'showStars', label: 'Stars' },
             { key: 'showForks', label: 'Forks' },
             { key: 'showIssues', label: 'Issues' },
             { key: 'showBadges', label: 'Languages' }
           ].map((item) => (
             <label key={item.key} className="flex items-center justify-between p-2.5 bg-zinc-900/50 rounded-lg border border-zinc-800 cursor-pointer hover:border-zinc-700">
                <span className="text-xs text-zinc-300">{item.label}</span>
                <input 
                  type="checkbox"
                  checked={(config as any)[item.key]}
                  onChange={(e) => handleChange(item.key as keyof CardConfig, e.target.checked)}
                  className="w-4 h-4 rounded border-zinc-600 text-indigo-600 focus:ring-indigo-600 bg-zinc-800"
                />
             </label>
           ))}
        </div>
      </div>

      {/* Text Overrides */}
      <div className="space-y-4 border-t border-zinc-800 pt-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
             <Layout className="w-4 h-4 text-blue-400" />
             Content Overrides
          </label>
          <div className="space-y-3">
            <div>
                <span className="text-xs text-zinc-500 mb-1 block">Title</span>
                <input 
                    type="text" 
                    value={config.customTitle}
                    onChange={(e) => handleChange('customTitle', e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
            </div>
            <div>
                <span className="text-xs text-zinc-500 mb-1 block">Description</span>
                <textarea 
                    value={config.customDescription}
                    onChange={(e) => handleChange('customDescription', e.target.value)}
                    rows={3}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                />
            </div>
          </div>
      </div>

    </div>
  );
};
