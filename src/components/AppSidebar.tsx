import React, { useState } from 'react';
import {
  Plus,
  Search,
  MessageSquare,
  Globe,
  Bookmark,
  History,
  Settings,
  X,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { ConversationSession } from '../types/browser';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ConversationSession[];
  activeId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onOpenBrowser: () => void;
  onOpenHistory: () => void;
  onOpenBookmarks: () => void;
  onOpenSettings: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onOpenBrowser,
  onOpenHistory,
  onOpenBookmarks,
  onOpenSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Agrupa conversas por data (Hoje, Ontem, Anteriores)
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const filtered = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groups: { label: string; items: ConversationSession[] }[] = [];
  const today: ConversationSession[] = [];
  const yesterday: ConversationSession[] = [];
  const older: ConversationSession[] = [];

  filtered.forEach((conv) => {
    const diff = now - conv.updatedAt;
    if (diff < oneDayMs) {
      today.push(conv);
    } else if (diff < oneDayMs * 2) {
      yesterday.push(conv);
    } else {
      older.push(conv);
    }
  });

  if (today.length > 0) groups.push({ label: 'Hoje', items: today });
  if (yesterday.length > 0) groups.push({ label: 'Ontem', items: yesterday });
  if (older.length > 0) groups.push({ label: 'Últimos 7 dias', items: older });

  return (
    <>
      {/* Backdrop para mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Drawer Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-slate-900 border-r border-slate-800 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-100">
              Morph Browser AI
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Fechar menu"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 pb-2 shrink-0">
          <button
            onClick={() => {
              onNewConversation();
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-xs font-semibold text-slate-100 flex items-center justify-between transition active:scale-95 shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" />
              Nova conversa
            </span>
            <span className="text-[10px] text-slate-400 font-mono">⌘N</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-3 pb-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar conversas..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Conversation List Grouped by Date */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4 scrollbar-none">
          {groups.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Nenhuma conversa encontrada.
            </div>
          ) : (
            groups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 block">
                  {group.label}
                </span>

                {group.items.map((conv) => {
                  const isActive = conv.id === activeId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        onSelectConversation(conv.id);
                        onClose();
                      }}
                      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition select-none ${
                        isActive
                          ? 'bg-slate-800 text-slate-100 font-semibold shadow-inner'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{conv.title}</span>
                      </div>

                      {/* Botão de excluir discreto */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteConversation(conv.id);
                        }}
                        aria-label="Excluir conversa"
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Bottom Actions Links */}
        <div className="p-2 border-t border-slate-800 bg-slate-950/60 shrink-0 space-y-0.5">
          <button
            onClick={() => {
              onOpenBrowser();
              onClose();
            }}
            className="w-full p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 transition"
          >
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Navegador Web Integrado</span>
          </button>

          <button
            onClick={() => {
              onOpenBookmarks();
              onClose();
            }}
            className="w-full p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 transition"
          >
            <Bookmark className="w-4 h-4 text-amber-400" />
            <span>Favoritos</span>
          </button>

          <button
            onClick={() => {
              onOpenHistory();
              onClose();
            }}
            className="w-full p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 transition"
          >
            <History className="w-4 h-4 text-indigo-400" />
            <span>Histórico de Tarefas</span>
          </button>

          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="w-full p-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2.5 transition"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Configurações</span>
          </button>
        </div>
      </aside>
    </>
  );
};
