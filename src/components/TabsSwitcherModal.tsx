import React from 'react';
import { Plus, X, Globe, RotateCcw, Check } from 'lucide-react';
import { BrowserTab } from '../types/browser';

interface TabsSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  tabs: BrowserTab[];
  activeTabId: string;
  onSwitchTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
  onRestoreClosed: () => void;
  recentlyClosedCount: number;
}

export const TabsSwitcherModal: React.FC<TabsSwitcherModalProps> = ({
  isOpen,
  onClose,
  tabs,
  activeTabId,
  onSwitchTab,
  onCloseTab,
  onNewTab,
  onRestoreClosed,
  recentlyClosedCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 p-4 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100">Guias Abertas</h2>
          <p className="text-xs text-slate-400">
            {tabs.length} {tabs.length === 1 ? 'guia ativa' : 'guias ativas'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {recentlyClosedCount > 0 && (
            <button
              onClick={onRestoreClosed}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              Reabrir Fechada ({recentlyClosedCount})
            </button>
          )}

          <button
            onClick={onNewTab}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition active:scale-95 shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Grid */}
      <div className="flex-1 overflow-y-auto py-4 grid grid-cols-2 gap-3">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => {
                onSwitchTab(tab.id);
                onClose();
              }}
              className={`group relative flex flex-col h-44 rounded-2xl border p-3 cursor-pointer transition-all duration-200 select-none ${
                isActive
                  ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-900/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              {/* Header inside tab thumbnail */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                  <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {tab.title || 'Nova Guia'}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  aria-label="Fechar aba"
                  className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Preview simulated card content */}
              <div className="flex-1 rounded-xl bg-slate-950 p-2 text-[10px] text-slate-400 font-mono truncate overflow-hidden border border-slate-850 flex flex-col justify-between">
                <span className="truncate text-cyan-300">{tab.url}</span>
                <div className="space-y-1 opacity-50">
                  <div className="h-2 w-3/4 bg-slate-800 rounded" />
                  <div className="h-2 w-1/2 bg-slate-800 rounded" />
                </div>
                {isActive && (
                  <span className="self-end text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-900/80 text-indigo-300 border border-indigo-500/30">
                    ATIVA
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action */}
      <div className="pt-3 border-t border-slate-800 flex justify-center">
        <button
          onClick={onNewTab}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:brightness-110 font-bold text-xs text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Abrir Nova Guia
        </button>
      </div>
    </div>
  );
};
