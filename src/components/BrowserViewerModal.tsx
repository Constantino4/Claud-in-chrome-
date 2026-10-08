import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  Layers,
  MessageSquare,
  Globe,
  ShieldCheck,
  Star,
  Eye,
} from 'lucide-react';
import { BrowserTab } from '../types/browser';

interface BrowserViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab?: BrowserTab;
  tabsCount: number;
  isBookmarked: boolean;
  isAgentRunning: boolean;
  onNavigate: (url: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
  onOpenTabs: () => void;
  onToggleBookmark: () => void;
  onOpenVision?: () => void;
  children: React.ReactNode; // BrowserEngine renderizado aqui
}

export const BrowserViewerModal: React.FC<BrowserViewerModalProps> = ({
  isOpen,
  onClose,
  currentTab,
  tabsCount,
  isBookmarked,
  isAgentRunning,
  onNavigate,
  onGoBack,
  onGoForward,
  onReload,
  onOpenTabs,
  onToggleBookmark,
  onOpenVision,
  children,
}) => {
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-slate-950 transition-all duration-300 ease-in-out ${
        isOpen
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Top Header Bar */}
      <div className="bg-slate-950/95 border-b border-slate-800 px-3 py-2 flex items-center justify-between gap-2 shrink-0">
        {/* Voltar ao Chat */}
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition active:scale-95 shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao chat</span>
        </button>

        {/* Address / URL Bar */}
        <div className="flex-1 max-w-md h-8 bg-slate-900 border border-slate-800 rounded-xl flex items-center px-2.5 text-xs text-slate-300 truncate">
          <div className="shrink-0 mr-1.5 text-emerald-400">
            {currentTab?.url.startsWith('https://') ? (
              <Lock className="w-3 h-3 text-emerald-400" />
            ) : (
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
            )}
          </div>
          <span className="truncate font-mono text-[11px] text-slate-300">
            {currentTab?.url || 'morph://home'}
          </span>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {onOpenVision && (
            <button
              onClick={onOpenVision}
              aria-label="Browser Vision (Olhos da IA)"
              title="Browser Vision (Olhos da IA)"
              className="px-2.5 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 transition flex items-center gap-1.5 text-xs font-semibold active:scale-95 shadow-sm"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Olhos</span>
            </button>
          )}

          <button
            onClick={onReload}
            aria-label="Recarregar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition"
          >
            <RotateCw className={`w-3.5 h-3.5 ${currentTab?.isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          <button
            onClick={onToggleBookmark}
            aria-label="Favorito"
            className={`p-1.5 rounded-lg transition ${
              isBookmarked ? 'text-amber-400' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={onOpenTabs}
            aria-label="Abas"
            className="px-2 py-1 rounded-lg bg-slate-850 border border-slate-700 text-[11px] font-mono font-bold text-slate-200"
          >
            {tabsCount}
          </button>
        </div>
      </div>

      {/* Indicador de agente controlando a página */}
      {isAgentRunning && (
        <div className="bg-gradient-to-r from-cyan-950 via-indigo-950 to-purple-950 border-b border-cyan-500/30 px-3 py-1 text-[11px] text-cyan-300 flex items-center justify-between shrink-0 animate-pulse">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-semibold">Agente Morph interagindo com a página em tempo real...</span>
          </div>
          <button
            onClick={onClose}
            className="text-[10px] text-white underline hover:text-cyan-200"
          >
            Ver no chat
          </button>
        </div>
      )}

      {/* Live Browser Engine Viewport */}
      <div className="flex-1 w-full relative overflow-hidden bg-slate-900">
        {children}
      </div>

      {/* Bottom Navigation Toolbar */}
      <div className="h-12 bg-slate-950/95 border-t border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onGoBack}
            disabled={!currentTab?.canGoBack}
            aria-label="Voltar página"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <button
            onClick={onGoForward}
            disabled={!currentTab?.canGoForward}
            aria-label="Avançar página"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 transition"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => onNavigate('morph://home')}
            aria-label="Página inicial"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition"
          >
            <Globe className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-200 transition"
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
          <span>Voltar ao chat</span>
        </button>
      </div>
    </div>
  );
};
