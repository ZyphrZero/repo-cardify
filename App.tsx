'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Download, Github, Layers, Layout } from 'lucide-react';
import { I18nProvider } from './components/I18nContext';
import { EditorCanvas } from './components/EditorCanvas';
import { ControlPanel } from './components/ControlPanel';
import { Locale, UiThemeMode, detectLocale, getLocaleMessages, isLocale } from './i18n';
import {
  buildEmbeddedFontCss,
  injectEmbeddedFontStyle,
  normalizeSvgFontFaces,
} from './services/exportFontService';
import { fetchRepoDetails } from './services/githubService';
import { exportConfigPreset, importConfigPreset } from './services/presetService';
import { CardConfig, LayoutBlockId, RepoData, createDefaultCardConfig } from './types';

type ResolvedUiTheme = 'light' | 'dark';
type RasterImageFormat = 'png' | 'jpg';

const UI_THEME_STORAGE_KEY = 'repo-cardify-ui-theme-mode';
const LOCALE_STORAGE_KEY = 'repo-cardify-locale';
const EXPORT_WIDTH = 1200;
const EXPORT_HEIGHT = 630;
const JPG_EXPORT_QUALITY = 0.82;

const normalizeSelection = (blocks: LayoutBlockId[], primary?: LayoutBlockId): LayoutBlockId[] => {
  const unique = Array.from(new Set(blocks));
  if (unique.length === 0) return [];
  const primaryBlock = primary && unique.includes(primary) ? primary : unique[0];
  return [primaryBlock, ...unique.filter((block) => block !== primaryBlock)];
};

const isUiThemeMode = (value: string): value is UiThemeMode =>
  value === 'system' || value === 'light' || value === 'dark';

export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [config, setConfig] = useState<CardConfig>(() => createDefaultCardConfig());
  const [selectedBlocks, setSelectedBlocks] = useState<LayoutBlockId[]>(['title']);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>('en');
  const [uiThemeMode, setUiThemeMode] = useState<UiThemeMode>('system');
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const primaryBlock: LayoutBlockId | null = selectedBlocks[0] ?? null;
  const resolvedUiTheme: ResolvedUiTheme = uiThemeMode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : uiThemeMode;
  const messages = getLocaleMessages(locale);

  const setSelection = useCallback((blocks: LayoutBlockId[], primary?: LayoutBlockId) => {
    setSelectedBlocks(normalizeSelection(blocks, primary));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedMode = window.localStorage.getItem(UI_THEME_STORAGE_KEY);
    if (storedMode && isUiThemeMode(storedMode)) {
      setUiThemeMode(storedMode);
    }

    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (storedLocale && isLocale(storedLocale)) {
      setLocale(storedLocale);
    } else {
      setLocale(detectLocale(window.navigator.language));
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemPrefersDark(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setSystemPrefersDark(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(UI_THEME_STORAGE_KEY, uiThemeMode);
    document.documentElement.dataset.uiTheme = resolvedUiTheme;
  }, [uiThemeMode, resolvedUiTheme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  const handleFetchRepo = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!repoUrl.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchRepoDetails(repoUrl);
      setRepoData(data);
      setConfig((prev) => ({
        ...prev,
        text: {
          ...prev.text,
          customTitle: data.name,
          customDescription: data.description || messages.app.noDescription,
        },
        customLogo: null,
      }));
    } catch (err: any) {
      setError(err.message || messages.app.failedFetchRepo);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setConfig((prev) => ({ ...prev, customLogo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleExportPreset = () => {
    exportConfigPreset(config);
  };

  const handleImportPreset = async (file: File) => {
    try {
      const imported = await importConfigPreset(file);
      setConfig(imported);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : messages.app.failedImportPreset;
      setError(message);
    }
  };

  const urlToBase64 = async (url: string): Promise<string> => {
    try {
      let response = await fetch(url);
      if (!response.ok) {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        response = await fetch(proxyUrl);
      }
      const blob = await response.blob();
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      return url;
    }
  };

  const serializeSvg = useCallback(async () => {
    if (!svgRef.current) return null;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgRef.current);

    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    source = normalizeSvgFontFaces(source);
    const embeddedFontCss = await buildEmbeddedFontCss(config.font);
    source = injectEmbeddedFontStyle(source, embeddedFontCss);

    if (repoData?.avatarUrl) {
      const base64Avatar = await urlToBase64(repoData.avatarUrl);
      if (base64Avatar.startsWith('data:')) {
        source = source.replace(/xlink:href="[^"]+"/, `xlink:href="${base64Avatar}"`);
      }
    }

    return source;
  }, [config.font, repoData]);

  const renderSvgToCanvas = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    const source = await serializeSvg();
    if (!source) return null;

    const canvas = document.createElement('canvas');
    canvas.width = EXPORT_WIDTH;
    canvas.height = EXPORT_HEIGHT;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas context is unavailable.');
    }

    const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
    await new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        context.fillStyle = '#18181b';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);
        resolve();
      };
      image.onerror = () => {
        reject(new Error('Failed to render SVG to canvas.'));
      };
      image.src = svgDataUrl;
    });

    return canvas;
  }, [serializeSvg]);

  const canvasToBlob = useCallback(
    (canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob> =>
      new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
            return;
          }
          reject(new Error('Failed to encode canvas to image blob.'));
        }, mimeType, quality);
      }),
    []
  );

  const downloadRasterImage = useCallback(
    async (format: RasterImageFormat) => {
      setLoading(true);
      try {
        const canvas = await renderSvgToCanvas();
        if (!canvas) return;

        const isJpeg = format === 'jpg';
        const mimeType = isJpeg ? 'image/jpeg' : 'image/png';
        const blob = await canvasToBlob(canvas, mimeType, isJpeg ? JPG_EXPORT_QUALITY : undefined);

        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `${repoData?.name || 'social-card'}.${format}`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error(err);
        setError(messages.app.failedDownload);
      } finally {
        setLoading(false);
      }
    },
    [canvasToBlob, messages.app.failedDownload, renderSvgToCanvas, repoData]
  );

  const downloadPng = useCallback(() => {
    void downloadRasterImage('png');
  }, [downloadRasterImage]);

  const downloadJpg = useCallback(() => {
    void downloadRasterImage('jpg');
  }, [downloadRasterImage]);

  const downloadSvg = useCallback(async () => {
    setLoading(true);
    try {
      const source = await serializeSvg();
      if (!source) return;
      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${repoData?.name || 'social-card'}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(messages.app.failedDownload);
    } finally {
      setLoading(false);
    }
  }, [serializeSvg, messages.app.failedDownload, repoData]);

  return (
    <I18nProvider locale={locale} setLocale={setLocale}>
      <div
        className={`app-ui-root app-theme-bg relative min-h-screen overflow-hidden text-zinc-900 ${
          resolvedUiTheme === 'light' ? 'app-ui-light' : 'app-ui-dark'
        }`}
      >
        <header className="relative z-20 app-surface border-b app-border backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-[1360px] items-center justify-between gap-4 px-4 py-4 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Github className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">{messages.header.designWorkspace}</p>
                <h1 className="text-xl font-semibold text-zinc-900">Repo Cardify</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 lg:gap-3">
              <span className="hidden rounded-md bg-zinc-100 px-2.5 py-1 text-[11px] text-zinc-500 md:block">
                {messages.header.tagline}
              </span>

              <label htmlFor="locale-mode" className="hidden text-xs text-zinc-500 sm:block">
                {messages.header.languageLabel}
              </label>
              <select
                id="locale-mode"
                value={locale}
                onChange={(event) => setLocale(event.target.value as Locale)}
                className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 outline-none transition-colors hover:bg-zinc-50 focus:border-indigo-500"
              >
                <option value="en">{messages.options.locale.en}</option>
                <option value="zh-CN">{messages.options.locale['zh-CN']}</option>
              </select>

              <label htmlFor="ui-theme-mode" className="hidden text-xs text-zinc-500 sm:block">
                {messages.header.interfaceLabel}
              </label>
              <select
                id="ui-theme-mode"
                value={uiThemeMode}
                onChange={(event) => setUiThemeMode(event.target.value as UiThemeMode)}
                className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-700 outline-none transition-colors hover:bg-zinc-50 focus:border-indigo-500"
              >
                <option value="system">{messages.options.uiThemeMode.system}</option>
                <option value="light">{messages.options.uiThemeMode.light}</option>
                <option value="dark">{messages.options.uiThemeMode.dark}</option>
              </select>
            </div>
          </div>
        </header>

        <main className="relative z-10 mx-auto flex w-full max-w-[1360px] flex-1 flex-col gap-5 px-4 py-5 lg:px-8 lg:py-6 xl:grid xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="flex min-h-[calc(100vh-150px)] flex-col overflow-hidden rounded-2xl app-card shadow-sm">
            <div className="px-5 py-5 md:px-6">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">{messages.app.repositoryWorkspace}</p>
                </div>
                <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-[11px] text-zinc-500">
                  {repoData ? messages.app.statusLoaded : messages.app.statusWaiting}
                </span>
              </div>

              <form onSubmit={handleFetchRepo} className="group">
                <div className="flex items-center gap-2 rounded-xl bg-zinc-100 p-2 transition-shadow group-focus-within:shadow-[0_0_0_3px_rgba(99,102,241,0.16)]">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-500">
                    <Github className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder={messages.app.placeholderRepo}
                    className="h-10 min-w-0 flex-1 border-none bg-transparent px-1 text-sm text-zinc-800 outline-none placeholder:text-zinc-500"
                    value={repoUrl}
                    onChange={(event) => setRepoUrl(event.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-10 min-w-[94px] items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : messages.app.fetch}
                  </button>
                </div>
              </form>

              {error && (
                <div
                  className={`mt-3 rounded-lg border px-3 py-2 text-sm ${
                    error.includes('Rate limit')
                      ? 'border-amber-800 bg-amber-900/20 text-amber-200'
                      : 'border-red-800 bg-red-900/20 text-red-200'
                  }`}
                >
                  {error}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
              <div className="mx-auto flex w-full max-w-6xl flex-1 items-start justify-center">
                {repoData ? (
                  <EditorCanvas
                    data={repoData}
                    config={config}
                    setConfig={setConfig}
                    selectedBlocks={selectedBlocks}
                    primaryBlock={primaryBlock}
                    setSelection={setSelection}
                    svgRef={svgRef}
                    onLogoUpload={handleLogoUpload}
                  />
                ) : (
                  <div className="mt-8 flex min-h-[420px] w-full max-w-5xl flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-8 text-center">
                    <Layout className="mb-4 h-14 w-14 opacity-30" />
                    <p className="text-sm text-zinc-400">{messages.app.waitingCanvasHint}</p>
                  </div>
                )}
              </div>
            </div>

            {repoData && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t app-border app-surface-muted px-5 py-4 md:px-6">
                <p className="text-xs text-zinc-500">{messages.app.readyToExportHint}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={downloadSvg}
                    className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-700"
                  >
                    <Download className="h-4 w-4" />
                    {messages.app.downloadSvg}
                  </button>
                  <button
                    type="button"
                    onClick={downloadPng}
                    className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-700"
                  >
                    <Download className="h-4 w-4" />
                    {messages.app.downloadPng}
                  </button>
                  <button
                    type="button"
                    onClick={downloadJpg}
                    className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-700"
                  >
                    <Download className="h-4 w-4" />
                    {messages.app.downloadJpg}
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="overflow-hidden rounded-2xl app-card shadow-sm xl:min-h-[calc(100vh-150px)]">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b app-border app-surface px-5 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-zinc-700">
                  <Layers className="h-4 w-4" />
                  <span>{messages.app.styleLayoutTitle}</span>
                </div>
                <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-[11px] text-zinc-500">
                  {messages.app.editorPanelBadge}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 md:px-5">
                <ControlPanel
                  config={config}
                  setConfig={setConfig}
                  disabled={!repoData}
                  onExportPreset={handleExportPreset}
                  onImportPreset={handleImportPreset}
                />
              </div>
            </div>
          </aside>
        </main>
      </div>
    </I18nProvider>
  );
}
