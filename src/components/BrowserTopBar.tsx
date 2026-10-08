import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  Star,
  Layers,
  Sparkles,
  X,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { BrowserTab } from '../types/browser';

interface BrowserTopBarProps {
  currentTab?: BrowserTab;
  tabsCount: number;
  isBookmarked: boolean;
  onNavigate: (url: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
  onOpenTabs: () => void;
  onToggleBookmark: () => void;
  onOpenAI: () => void;
  isAiActive: boolean;
}

export const BrowserTopBar: React.FC<BrowserTopBarProps> = ({
  currentTab,
  tabsCount,
  isBookmarked,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onOpenTabs,
  onToggleBookmark,
  onOpenAI,
  isAiActive,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentTab?.url) {
      setInputValue(currentTab.url);
    }
  }, [currentTab?.url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputValue.trim();
    if (!clean) return;

    // Se começar com http:// ou https:// ou morph://, navega direto
    if (/^(https?:\/\/|morph:\/\/)/i.test(clean)) {
      onNavigate(clean);
    } else if (clean.includes('.') && !clean.includes(' ')) {
      // Exemplo: exemplo.com -> https://exemplo.com
      onNavigate(`https://${clean}`);
    } else {
      // Pesquisa no Morph Search
      onNavigate(`morph://search?q=${encodeURIComponent(clean)}`);
    }
    setIsEditing(false);
  };

  const displayUrl = currentTab?.url.replace(/^https?:\/\//, '').replace(/^morph:\/\//, '') || 'morph://home';

  return (
    <div className="bg-slate-950 border-b border-slate-800/80 px-2 py-2 flex flex-col gap-1.5 z-20">
      <div className="flex items-center gap-1.5">
        {/* Navigation buttons */}
        <div className="flex items-center gap-0.5 text-slate-400">
          <button
            onClick={onGoBack}
            disabled={!currentTab?.canGoBack}
            aria-label="Voltar"
            className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition active:scale-90"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onGoForward}
            disabled={!currentTab?.canGoForward}
            aria-label="Avançar"
            className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition active:scale-90"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onReload}
            aria-label="Recarregar"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 transition active:scale-90"
          >
            <RotateCw className={`w-3.5 h-3.5 ${currentTab?.isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Omnibox (Address & Search Bar) */}
        <form onSubmit={handleSubmit} className="flex-1 relative flex items-center">
          <div className="w-full h-9 bg-slate-900 border border-slate-800 hover:border-slate-700 focus-within:border-indigo-500 rounded-xl flex items-center px-2.5 transition shadow-inner">
            <div className="shrink-0 mr-1.5 text-emerald-400 flex items-center">
              {currentTab?.url.startsWith('https://') ? (
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
              ) : currentTab?.url.startsWith('morph://') ? (
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              ) : (
                <Search className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>

            <input
              type="text"
              value={inputValue}
              onFocus={() => setIsEditing(true)}
              onBlur={() => {
                // Pequeno atraso para permitir clique em botões internos
                setTimeout(() => setIsEditing(false), 200);
              }}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Pesquisar ou digitar URL..."
              className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none selection:bg-indigo-600 truncate"
            />

            {inputValue && isEditing && (
              <button
                type="button"
                onClick={() => setInputValue('')}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Favorite Bookmark Star button */}
            <button
              type="button"
              onClick={onToggleBookmark}
              aria-label="Favorito"
              className={`p-1 ml-1 rounded-md transition ${
                isBookmarked ? 'text-amber-400 fill-amber-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </form>

        {/* Tabs Counter Button */}
        <button
          onClick={onOpenTabs}
          aria-label="Gerenciar Abas"
          className="relative px-2 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold font-mono active:scale-95 transition"
        >
          <span className="w-5 h-5 flex items-center justify-center rounded-md border border-slate-700 text-[11px]">
            {tabsCount}
          </span>
        </button>

        {/* AI Agent Sparkle Button */}
        <button
          onClick={onOpenAI}
          aria-label="Agente de IA"
          className={`relative p-2 rounded-xl text-white font-semibold transition active:scale-95 shadow-md flex items-center justify-center ${
            isAiActive
              ? 'bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 ring-2 ring-cyan-400/50 shadow-cyan-500/20'
              : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'
          }`}
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full border-2 border-slate-950" />
        </button>
      </div>

      {/* Loading Progress Bar */}
      {currentTab?.isLoading && (
        <div className="w-full h-0.5 bg-slate-800 overflow-hidden rounded-full">
          <div className="h-full bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500 animate-pulse w-3/4 rounded-full" />
        </div>
      )}
    </div>
  );
};
