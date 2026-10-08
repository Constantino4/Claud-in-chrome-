import React, { useState, useEffect } from 'react';
import { Search, Mic, ArrowLeft, ExternalLink, Globe } from 'lucide-react';

interface GoogleWebPageProps {
  initialQuery?: string;
  onNavigate?: (url: string) => void;
  onBack?: () => void;
}

export const GoogleWebPage: React.FC<GoogleWebPageProps> = ({
  initialQuery = '',
  onNavigate,
  onBack,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [hasSearched, setHasSearched] = useState(!!initialQuery);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setSubmittedQuery(initialQuery);
      setHasSearched(true);
    }
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSubmittedQuery(query);
    setHasSearched(true);
  };

  // Resultados dinâmicos gerados com base na pesquisa
  const searchResults = [
    {
      title: `${submittedQuery || 'Smartphones Samsung'} - Ofertas e Preços no Brasil`,
      url: 'https://www.samsung.com/br/smartphones/',
      snippet: `Conheça a linha completa de smartphones Samsung Galaxy. Compare modelos, preços acessíveis e compre online com frete grátis e garantia oficial.`,
    },
    {
      title: `Os 5 Melhores Celulares Samsung Baratos de 2025 - Guia de Compra`,
      url: 'https://techshop.morph.app/samsung',
      snippet: `Análise técnica dos modelos mais vendidos: Galaxy A15 por R$ 799, Galaxy A05s por R$ 699 e Galaxy M15 5G com bateria de 6.000 mAh.`,
    },
    {
      title: `Samsung Galaxy na TechShop Brasil: Promoções em até 10x sem juros`,
      url: 'morph://techshop',
      snippet: `Catálogo de smartphones com menor preço garantido. Aproveite descontos no Galaxy A15 e modelos de entrada com entrega rápida.`,
    },
    {
      title: `Samsung Electronics - Wikipédia, a enciclopédia livre`,
      url: 'https://pt.wikipedia.org/wiki/Samsung_Electronics',
      snippet: `A Samsung Electronics é uma empresa multinacional sul-coreana de eletrônicos, sendo uma das maiores fabricantes mundiais de smartphones.`,
    },
  ];

  return (
    <div className="min-h-full bg-white text-slate-800 flex flex-col font-sans select-text pb-20">
      {/* Barra de Navegação do Google */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              data-morph-id="BUTTON_GOOGLE_BACK"
              className="p-1 rounded-md hover:bg-slate-100 text-slate-600"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span className="font-semibold text-slate-600">Google Brasil</span>
        </div>

        <div className="flex items-center gap-3 text-slate-600">
          <span className="hover:underline cursor-pointer">Gmail</span>
          <span className="hover:underline cursor-pointer">Imagens</span>
          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
            M
          </div>
        </div>
      </div>

      {!hasSearched ? (
        /* Tela Inicial do Google */
        <div className="flex-1 flex flex-col items-center justify-center p-4 my-auto">
          {/* Logo do Google Oficial */}
          <div className="mb-6 select-none">
            <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
              <span className="text-blue-500">G</span>
              <span className="text-red-500">o</span>
              <span className="text-amber-500">o</span>
              <span className="text-blue-500">g</span>
              <span className="text-green-500">l</span>
              <span className="text-red-500">e</span>
            </span>
          </div>

          {/* Campo de Busca do Google (INPUT_01) */}
          <form onSubmit={handleSearch} className="w-full max-w-lg mb-6">
            <div className="w-full h-11 border border-slate-250 hover:border-slate-350 focus-within:shadow-md rounded-full px-4 flex items-center gap-3 bg-white shadow-sm transition">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                name="q"
                data-morph-id="INPUT_01"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar no Google ou digitar um URL"
                className="flex-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
              />
              <Mic className="w-4 h-4 text-blue-500 shrink-0 cursor-pointer" />
            </div>

            {/* Botões do Google (BUTTON_01 e BUTTON_02) */}
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="submit"
                data-morph-id="BUTTON_01"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md text-xs font-medium text-slate-700 transition"
              >
                Pesquisa Google
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery('smartphones Samsung');
                  setSubmittedQuery('smartphones Samsung');
                  setHasSearched(true);
                }}
                data-morph-id="BUTTON_02"
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md text-xs font-medium text-slate-700 transition"
              >
                Estou com sorte
              </button>
            </div>
          </form>

          <div className="text-xs text-slate-500 mt-4">
            Disponibilizado pelo Google em: <span className="text-blue-600 hover:underline">Português (Brasil)</span>
          </div>
        </div>
      ) : (
        /* Página de Resultados do Google */
        <div className="flex-1 flex flex-col p-4 max-w-2xl">
          {/* Header de Resultados com Logo e Input */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-200 mb-4">
            <span
              onClick={() => setHasSearched(false)}
              className="text-xl font-extrabold cursor-pointer select-none"
            >
              <span className="text-blue-500">G</span>
              <span className="text-red-500">o</span>
              <span className="text-amber-500">o</span>
              <span className="text-blue-500">g</span>
              <span className="text-green-500">l</span>
              <span className="text-red-500">e</span>
            </span>

            <form onSubmit={handleSearch} className="flex-1">
              <div className="w-full h-9 border border-slate-300 rounded-full px-3 flex items-center gap-2 bg-white shadow-inner">
                <input
                  type="text"
                  name="q"
                  data-morph-id="INPUT_01"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 text-xs text-slate-800 focus:outline-none"
                />
                <button type="submit" data-morph-id="BUTTON_01" className="p-1 text-blue-500">
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>

          <div className="text-[11px] text-slate-500 mb-3">
            Aproximadamente 4.250.000 resultados (0,32 segundos) para <strong>"{submittedQuery}"</strong>
          </div>

          {/* Lista de Resultados Reais do Google */}
          <div className="space-y-4">
            {searchResults.map((res, idx) => (
              <div key={idx} className="space-y-0.5">
                <span className="text-[11px] text-slate-500 font-mono block truncate">
                  {res.url}
                </span>
                <h3
                  onClick={() => onNavigate && onNavigate(res.url)}
                  data-morph-id={`LINK_${String(idx + 1).padStart(2, '0')}`}
                  className="text-sm font-semibold text-blue-700 hover:underline cursor-pointer flex items-center gap-1"
                >
                  {res.title}
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {res.snippet}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
