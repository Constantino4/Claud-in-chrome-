import React, { useState } from 'react';
import { Bookmark, History, Trash2, X, ExternalLink, Search } from 'lucide-react';
import { HistoryItem, BookmarkItem } from '../types/browser';

interface BookmarksHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'bookmarks' | 'history';
  bookmarks: BookmarkItem[];
  history: HistoryItem[];
  onNavigate: (url: string) => void;
  onClearHistory: () => void;
  onRemoveBookmark: (url: string) => void;
}

export const BookmarksHistoryModal: React.FC<BookmarksHistoryModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'bookmarks',
  bookmarks,
  history,
  onNavigate,
  onClearHistory,
  onRemoveBookmark,
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'history'>(initialTab);
  const [searchFilter, setSearchFilter] = useState('');

  if (!isOpen) return null;

  const filteredBookmarks = bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      b.url.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const filteredHistory = history.filter(
    (h) =>
      h.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      h.url.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 p-4 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'bookmarks'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Favoritos ({bookmarks.length})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Histórico ({history.length})
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="pt-3 pb-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={`Buscar em ${activeTab === 'bookmarks' ? 'favoritos' : 'histórico'}...`}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto py-2 space-y-2">
        {activeTab === 'bookmarks' ? (
          filteredBookmarks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Nenhum favorito encontrado.
            </div>
          ) : (
            filteredBookmarks.map((bm) => (
              <div
                key={bm.id}
                onClick={() => {
                  onNavigate(bm.url);
                  onClose();
                }}
                className="p-3 bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer transition group"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">{bm.icon || '⭐'}</span>
                    <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-indigo-300">
                      {bm.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono truncate pl-5">
                    {bm.url}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBookmark(bm.url);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              Histórico de navegação vazio.
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onNavigate(item.url);
                  onClose();
                }}
                className="p-3 bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer transition group"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-cyan-300">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                    <span className="truncate">{item.url}</span>
                    <span>•</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 shrink-0" />
              </div>
            ))
          )
        )}
      </div>

      {/* Clear History Button */}
      {activeTab === 'history' && history.length > 0 && (
        <div className="pt-3 border-t border-slate-800">
          <button
            onClick={onClearHistory}
            className="w-full py-2 bg-rose-950/40 border border-rose-500/30 hover:bg-rose-900/50 rounded-xl text-xs font-bold text-rose-300 flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpar Todo o Histórico
          </button>
        </div>
      )}
    </div>
  );
};
