import React from 'react';
import { Home, Bookmark, History, Settings, Sparkles, Shield, ArrowLeft, ArrowRight } from 'lucide-react';

interface BrowserBottomNavProps {
  onGoHome: () => void;
  onOpenBookmarks: () => void;
  onOpenHistory: () => void;
  onOpenPrivacy: () => void;
  onOpenSettings: () => void;
  onOpenAI: () => void;
  isAiOpen: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
}

export const BrowserBottomNav: React.FC<BrowserBottomNavProps> = ({
  onGoHome,
  onOpenBookmarks,
  onOpenHistory,
  onOpenPrivacy,
  onOpenSettings,
  onOpenAI,
  isAiOpen,
  canGoBack,
  canGoForward,
  onGoBack,
  onGoForward,
}) => {
  return (
    <div className="h-14 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 px-4 flex items-center justify-between z-20">
      {/* Home */}
      <button
        onClick={onGoHome}
        aria-label="Página Inicial"
        className="p-2 text-slate-400 hover:text-slate-100 active:scale-95 transition flex flex-col items-center gap-0.5"
      >
        <Home className="w-4 h-4" />
        <span className="text-[9px] font-medium">Início</span>
      </button>

      {/* Bookmarks */}
      <button
        onClick={onOpenBookmarks}
        aria-label="Favoritos"
        className="p-2 text-slate-400 hover:text-slate-100 active:scale-95 transition flex flex-col items-center gap-0.5"
      >
        <Bookmark className="w-4 h-4" />
        <span className="text-[9px] font-medium">Favoritos</span>
      </button>

      {/* Center Morph AI Agent Button */}
      <button
        onClick={onOpenAI}
        aria-label="Morph Agente de IA"
        className={`-mt-5 px-3.5 py-2 rounded-2xl flex items-center gap-1.5 font-bold text-xs text-white shadow-lg active:scale-95 transition ${
          isAiOpen
            ? 'bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 ring-2 ring-cyan-400/60 shadow-cyan-500/25'
            : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:brightness-110 shadow-indigo-600/30'
        }`}
      >
        <Sparkles className="w-4 h-4 animate-pulse text-cyan-200" />
        <span>Morph AI</span>
      </button>

      {/* History */}
      <button
        onClick={onOpenHistory}
        aria-label="Histórico"
        className="p-2 text-slate-400 hover:text-slate-100 active:scale-95 transition flex flex-col items-center gap-0.5"
      >
        <History className="w-4 h-4" />
        <span className="text-[9px] font-medium">Histórico</span>
      </button>

      {/* Settings & Privacy */}
      <button
        onClick={onOpenSettings}
        aria-label="Configurações e Privacidade"
        className="p-2 text-slate-400 hover:text-slate-100 active:scale-95 transition flex flex-col items-center gap-0.5"
      >
        <Settings className="w-4 h-4" />
        <span className="text-[9px] font-medium">Ajustes</span>
      </button>
    </div>
  );
};
