import React, { useState } from 'react';
import { Search, Play, ThumbsUp, ArrowLeft, Share2, Flame, Compass } from 'lucide-react';

interface YouTubeWebPageProps {
  onBack?: () => void;
  onNavigate?: (url: string) => void;
}

export const YouTubeWebPage: React.FC<YouTubeWebPageProps> = ({ onBack, onNavigate }) => {
  const [query, setQuery] = useState('');

  const videos = [
    {
      id: 'vid_1',
      title: 'Top 5 Celulares Samsung Custo-Benefício em 2025!',
      channel: 'TechReview Brasil',
      views: '245 mil visualizações • há 3 dias',
      duration: '12:45',
      color: 'bg-indigo-900',
    },
    {
      id: 'vid_2',
      title: 'Galaxy A15 5G Vale a Pena? Teste de Câmera e Bateria Completo',
      channel: 'Canal Tecnologia',
      views: '180 mil visualizações • há 1 semana',
      duration: '15:20',
      color: 'bg-emerald-900',
    },
    {
      id: 'vid_3',
      title: 'Como Funcionam os Agentes de IA em Navegadores Web?',
      channel: 'Inteligência Artificial Hoje',
      views: '92 mil visualizações • há 4 dias',
      duration: '08:30',
      color: 'bg-purple-900',
    },
  ];

  return (
    <div className="min-h-full bg-slate-950 text-white font-sans flex flex-col pb-20 select-text">
      {/* Top Header YouTube */}
      <div className="h-12 border-b border-slate-800 px-3 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              data-morph-id="BUTTON_YOUTUBE_BACK"
              className="p-1 rounded-md hover:bg-slate-800 text-slate-400"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-1 font-bold text-sm tracking-tight">
            <div className="w-6 h-4 bg-red-600 rounded-md flex items-center justify-center">
              <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
            </div>
            <span>YouTube</span>
            <span className="text-[10px] text-slate-500 font-normal">BR</span>
          </div>
        </div>

        {/* Input de Busca do YouTube (INPUT_01) */}
        <div className="flex-1 max-w-xs relative flex items-center">
          <input
            type="text"
            data-morph-id="INPUT_01"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full bg-slate-900 border border-slate-700 rounded-full pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
        </div>
      </div>

      {/* Categorias rápidas */}
      <div className="flex gap-2 px-3 py-2 border-b border-slate-850 overflow-x-auto scrollbar-none text-xs">
        <span className="px-3 py-1 bg-white text-slate-950 font-bold rounded-lg shrink-0">Tudo</span>
        <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg shrink-0">Smartphones</span>
        <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg shrink-0">Inteligência Artificial</span>
        <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-lg shrink-0">Tecnologia</span>
      </div>

      {/* Feed de Vídeos */}
      <div className="p-3 space-y-4 max-w-lg mx-auto w-full">
        {videos.map((vid, idx) => (
          <div
            key={vid.id}
            data-morph-id={`CARD_VIDEO_${idx + 1}`}
            className="rounded-2xl bg-slate-900/80 border border-slate-850 overflow-hidden space-y-2 group cursor-pointer"
          >
            {/* Thumbnail */}
            <div className={`w-full h-36 ${vid.color} relative flex items-center justify-center`}>
              <Play className="w-10 h-10 text-white/80 group-hover:scale-110 transition" />
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono font-bold">
                {vid.duration}
              </span>
            </div>

            {/* Informações */}
            <div className="p-3 pt-1 space-y-1">
              <h3 className="text-xs font-bold text-slate-100 line-clamp-2 group-hover:text-red-400 transition">
                {vid.title}
              </h3>
              <p className="text-[11px] text-slate-400">{vid.channel}</p>
              <p className="text-[10px] text-slate-500">{vid.views}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
