'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Github, Download, Layout, Layers } from 'lucide-react';
import { CardPreview } from './components/CardPreview';
import { ControlPanel } from './components/ControlPanel';
import { fetchRepoDetails } from './services/githubService';
import { RepoData, CardConfig, ThemeType, FontType, PatternType, BadgeStyle, AvatarBackgroundType } from './types';

const INITIAL_CONFIG: CardConfig = {
  theme: ThemeType.Gradient,
  font: FontType.Inter,
  pattern: PatternType.None,
  patternScale: 1.0, // 默认 1.0x 缩放
  badgeStyle: BadgeStyle.Pill,
  avatarBackground: AvatarBackgroundType.Rounded,
  avatarRadius: 24,
  showOwner: true,
  showAvatar: true,
  showStars: true,
  showForks: true,
  showIssues: true,
  showBadges: true,
  bgColor: '#4f46e5', // Indigo-600
  accentColor: '#ffffff',
  customTitle: '',
  customDescription: '',
  customLogo: null,
};

export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [config, setConfig] = useState<CardConfig>(INITIAL_CONFIG);
  const [error, setError] = useState<string | null>(null);
  
  // Ref for the SVG container to handle download
  const svgRef = useRef<SVGSVGElement>(null);

  const handleFetchRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchRepoDetails(repoUrl);
      setRepoData(data);
      // Reset custom fields when new repo is loaded
      setConfig(prev => ({
        ...prev,
        customTitle: data.name,
        customDescription: data.description || 'No description provided.',
        customLogo: null // Reset custom logo on new fetch
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch repository');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setConfig(prev => ({ ...prev, customLogo: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // Helper: Convert image URL to base64 to avoid canvas tainting
  // Uses CORS proxy to handle cross-origin images
  const urlToBase64 = async (url: string): Promise<string> => {
    try {
      // Try direct fetch first (some CDNs support CORS)
      let response = await fetch(url);
      if (!response.ok) {
        // Fallback to CORS proxy
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
      return url; // Fallback to original URL if fetch fails
    }
  };

  const downloadImage = useCallback(async () => {
    if (!svgRef.current) return;

    setLoading(true);
    try {
      const svg = svgRef.current;
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svg);

      // Safety check for namespaces
      if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
          source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      if(!source.match(/^<svg[^>]+xmlns:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/)){
          source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
      }

      // Convert external images (avatars) to base64 to avoid canvas tainting
      const avatarUrlMatch = source.match(/xlink:href="([^"]+)"/g);
      if (avatarUrlMatch && repoData?.avatarUrl) {
        const base64Avatar = await urlToBase64(repoData.avatarUrl);
        // Only replace if we got a valid base64 result (not the original URL)
        if (base64Avatar.startsWith('data:')) {
          source = source.replace(/xlink:href="[^"]+"/, `xlink:href="${base64Avatar}"`);
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 630;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      const svgBlob = new Blob([source], {type: "image/svg+xml;charset=utf-8"});
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        URL.revokeObjectURL(url);
        ctx.fillStyle = '#18181b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngUrl = canvas.toDataURL("image/png");

        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `${repoData?.name || 'social-card'}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        console.error('Failed to load image for download');
      };
      img.src = url;
    } finally {
      setLoading(false);
    }
  }, [repoData]);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Github className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Repo Cardify
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <span className="text-xs text-zinc-500 hidden sm:block">GitHub Social Card Generator</span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden max-h-[calc(100vh-64px)]">
        
        {/* Left: Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 bg-zinc-950/50 flex flex-col items-center justify-start gap-8 relative">
          
          {/* Input Section */}
          <div className="w-full max-w-2xl z-10 flex flex-col gap-3">
            <form onSubmit={handleFetchRepo} className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-20 group-focus-within:opacity-40 transition-opacity blur-md"></div>
              <div className="relative flex gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-xl shadow-xl">
                <input
                  type="text"
                  placeholder="github_username/repository_name"
                  className="flex-1 bg-transparent border-none outline-none px-4 text-zinc-100 placeholder-zinc-500 h-10"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <>Fetch</>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className={`p-3 rounded-lg text-sm text-center border ${error.includes('Rate limit') ? 'bg-amber-900/20 border-amber-800 text-amber-200' : 'bg-red-900/20 border-red-800 text-red-200'}`}>
                {error}
              </div>
            )}
          </div>

          {/* Canvas Wrapper */}
          <div className="w-full max-w-4xl flex-1 flex items-center justify-center relative min-h-[400px]">
            {repoData ? (
               <div className="relative shadow-2xl shadow-black/50 rounded-lg overflow-hidden border border-zinc-800/50">
                 {/* The Actual SVG Component */}
                 <CardPreview 
                    ref={svgRef} 
                    data={repoData} 
                    config={config} 
                  />
               </div>
            ) : (
              <div className="text-center text-zinc-500 flex flex-col items-center">
                <Layout className="w-16 h-16 mb-4 opacity-20" />
                <p>Enter a GitHub repository to generate a card</p>
              </div>
            )}
          </div>

          {/* Action Bar */}
          {repoData && (
             <div className="flex gap-4">
                <button
                  onClick={downloadImage}
                  className="bg-white text-zinc-900 hover:bg-zinc-200 px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download PNG
                </button>
             </div>
          )}
        </div>

        {/* Right: Controls Sidebar */}
        <div className="w-full lg:w-96 bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-800 overflow-y-auto">
          <div className="p-6 space-y-8">
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-400 uppercase tracking-wider">
              <Layers className="w-4 h-4" />
              <span>Configuration</span>
            </div>

            <ControlPanel 
              config={config} 
              setConfig={setConfig} 
              onLogoUpload={handleLogoUpload}
              disabled={!repoData}
            />
          </div>
        </div>

      </main>
    </div>
  );
}
