import React, { useState } from 'react';
import { Search, Sparkles, TrendingUp, ShoppingBag, Globe, ArrowRight, ShieldCheck } from 'lucide-react';

interface MorphSearchPageProps {
  onNavigate: (url: string) => void;
  initialQuery?: string;
}

export const MorphSearchPage: React.FC<MorphSearchPageProps> = ({ onNavigate, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);

  const searchResults = [
    {
      title: 'TechShop Brasil: Comparativo dos Melhores Celulares Baratos de 2025',
      snippet: 'Veja a análise dos smartphones mais acessíveis: Samsung Galaxy A15, Xiaomi Redmi 13C e Moto G54 com bateria duradoura e ótimas câmeras.',
      url: 'morph://techshop',
      badge: 'Catálogo de Produtos',
      type: 'store',
    },
    {
      title: 'WikiMorph: Como funcionam os Agentes de IA em Navegadores Modernos',
      snippet: 'Artigo completo explicando a transição de simples buscadores para navegadores autônomos orientados a objetivos com pontes JavaScript seguras.',
      url: 'morph://wiki',
      badge: 'Enciclopédia',
      type: 'wiki',
    },
    {
      title: 'Suporte & Atendimento ao Cliente Morph',
      snippet: 'Precisa de ajuda ou deseja enviar um feedback? Preencha o formulário oficial de suporte técnico e fale diretamente com a equipe.',
      url: 'morph://contact',
      badge: 'Formulário',
      type: 'contact',
    },
    {
      title: 'Morph Viagens: Reserva de Passagens e Hotéis',
      snippet: 'Encontre passagens aéreas e acomodações com descontos exclusivos. Reserva rápida com confirmação de pagamento protegida.',
      url: 'morph://booking',
      badge: 'Serviço',
      type: 'booking',
    },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();
    if (!clean) return;

    // Se for URL direta
    if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('morph://')) {
      onNavigate(clean);
      return;
    }

    // Roteamento semântico de pesquisa
    if (/celular|smartphone|barat|preço|tech|loja|comprar|samsung|redmi|motorola/i.test(clean)) {
      onNavigate('morph://techshop');
    } else if (/wiki|ia|navegador|agente|artigo|enciclopedia/i.test(clean)) {
      onNavigate('morph://wiki');
    } else if (/contato|suporte|ajuda|atendimento|formulario/i.test(clean)) {
      onNavigate('morph://contact');
    } else if (/voo|reserva|viagem|passagem|hotel/i.test(clean)) {
      onNavigate('morph://booking');
    } else {
      onNavigate(`morph://search?q=${encodeURIComponent(clean)}`);
    }
  };

  return (
    <div className="min-h-full bg-slate-900 text-slate-100 p-4 pb-20 select-text">
      {/* Header Search Brand */}
      <div className="flex flex-col items-center justify-center pt-6 pb-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-indigo-300 bg-clip-text text-transparent">
          Morph Search
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          O buscador nativo do Morph Browser com compreensão semântica e agente integrado
        </p>
      </div>

      {/* Input Search Form */}
      <form onSubmit={handleSearchSubmit} className="mb-6 max-w-md mx-auto">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            type="text"
            data-morph-id="INPUT_01"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar na web ou digitar URL..."
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-10 pr-24 py-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
          />
          <button
            type="submit"
            data-morph-id="BUTTON_01"
            className="absolute right-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg text-white transition-all shadow"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* Quick Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none mb-4 max-w-md mx-auto">
        <button
          onClick={() => onNavigate('morph://techshop')}
          data-morph-id="BUTTON_02"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 hover:border-indigo-500/50 text-xs text-slate-300 whitespace-nowrap active:scale-95 transition"
        >
          <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
          Celulares Baratos
        </button>
        <button
          onClick={() => onNavigate('morph://wiki')}
          data-morph-id="BUTTON_03"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 hover:border-indigo-500/50 text-xs text-slate-300 whitespace-nowrap active:scale-95 transition"
        >
          <Globe className="w-3.5 h-3.5 text-purple-400" />
          Navegadores com IA
        </button>
        <button
          onClick={() => onNavigate('morph://contact')}
          data-morph-id="BUTTON_04"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 hover:border-indigo-500/50 text-xs text-slate-300 whitespace-nowrap active:scale-95 transition"
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          Formulário de Contato
        </button>
      </div>

      {/* Search Results Feed */}
      <div className="space-y-3 max-w-md mx-auto">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Resultados recomendados para você</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" /> Verificado
          </span>
        </div>

        {searchResults.map((result, idx) => (
          <div
            key={idx}
            className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-800 hover:border-slate-700 transition space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-300">
                {result.badge}
              </span>
              <span className="text-[11px] text-slate-500 font-mono">{result.url}</span>
            </div>

            <h2 className="text-sm font-semibold text-indigo-300 group-hover:text-indigo-200 line-clamp-1">
              {result.title}
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {result.snippet}
            </p>

            <div className="pt-1 flex justify-end">
              <button
                onClick={() => onNavigate(result.url)}
                data-morph-id={`BUTTON_NAV_${idx + 1}`}
                className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition"
              >
                Acessar página <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
