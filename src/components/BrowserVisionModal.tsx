import React, { useState, useEffect } from 'react';
import {
  Eye,
  X,
  Camera,
  Search,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Code,
  Layers,
  HelpCircle,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { browserVision } from '../services/BrowserVision';
import { tabManager } from '../services/TabManager';
import { VisionSnapshot, VisionElement } from '../types/browser';

interface BrowserVisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  domContainer?: HTMLElement | null;
}

export const BrowserVisionModal: React.FC<BrowserVisionModalProps> = ({
  isOpen,
  onClose,
  domContainer,
}) => {
  const [snapshot, setSnapshot] = useState<VisionSnapshot | null>(null);
  const [activeTab, setActiveTab] = useState<'gemini' | 'elements' | 'debug'>('gemini');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [geminiAnswer, setGeminiAnswer] = useState<string>('');
  const [userQuery, setUserQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [copiedJson, setCopiedJson] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const currentTab = tabManager.getActiveTab();

  // Carrega ou captura o snapshot quando o modal abre
  const refreshVision = async (includeScreenshot = true) => {
    setIsCapturing(true);
    try {
      const targetContainer = domContainer || document.querySelector('.bg-slate-900') as HTMLElement;
      if (targetContainer && currentTab) {
        const snap = await browserVision.captureFullVision(
          targetContainer,
          currentTab.url,
          currentTab.title || 'Morph Browser',
          includeScreenshot
        );
        setSnapshot(snap);
      } else {
        const last = browserVision.getLastSnapshot();
        if (last) setSnapshot(last);
      }
    } catch (err) {
      console.error('[BrowserVisionModal] Erro ao atualizar visão:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshVision(true);
    }
  }, [isOpen, currentTab?.url]);

  const handleAskGemini = async (question: string) => {
    if (!snapshot) return;
    setIsAnalyzing(true);
    setGeminiAnswer('');
    try {
      const result = await browserVision.analyzeWithGeminiVision(snapshot, question);
      setGeminiAnswer(result.answer);
    } catch (err: any) {
      setGeminiAnswer(`Erro ao consultar Gemini Vision: ${err?.message || 'Falha de conexão.'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyJson = () => {
    if (!snapshot) return;
    navigator.clipboard.writeText(JSON.stringify(snapshot, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  if (!isOpen) return null;

  const quickQuestions = [
    'O que existe nesta página?',
    'Onde está a caixa de pesquisa?',
    'Quais botões estão visíveis?',
    'Qual é o texto principal?',
    'Existe algum menu?',
  ];

  const filteredElements = (snapshot?.elements || []).filter((el) => {
    const matchesType = selectedTypeFilter === 'all' || el.type === selectedTypeFilter;
    const matchesSearch =
      !searchFilter ||
      el.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      el.text.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (el.placeholder || '').toLowerCase().includes(searchFilter.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 vision-ignore">
      <div className="bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-2xl w-full max-w-3xl max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-100 text-sm">Browser Vision (Olhos da IA)</h3>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Somente Leitura
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                {snapshot?.page.title || currentTab?.title || 'Página Web'} • {snapshot?.page.url || currentTab?.url}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => refreshVision(true)}
              disabled={isCapturing}
              title="Recapturar DOM e Screenshot"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isCapturing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Abas */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 text-xs font-medium px-4">
          <button
            onClick={() => setActiveTab('gemini')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'gemini'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Gemini Vision
          </button>
          <button
            onClick={() => setActiveTab('elements')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'elements'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Elementos Identificados ({snapshot?.elements.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('debug')}
            className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition ${
              activeTab === 'debug'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Debug / JSON
          </button>
        </div>

        {/* Conteúdo das Abas */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* ABA 1: GEMINI VISION */}
          {activeTab === 'gemini' && (
            <div className="space-y-4">
              {/* Screenshot Preview Card */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
                <div className="flex items-center gap-3">
                  {snapshot?.screenshotBase64 ? (
                    <img
                      src={snapshot.screenshotBase64}
                      alt="Captura da tela"
                      className="w-16 h-12 object-cover rounded-lg border border-slate-700 shadow-sm"
                    />
                  ) : (
                    <div className="w-16 h-12 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500">
                      <Camera className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-medium text-slate-200 flex items-center gap-1.5">
                      <span>Screenshot da Área Visível</span>
                      {snapshot?.screenshotAvailable ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          Disponível
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          Indisponível no proxy
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Combina visão computacional por imagem + análise estrutural do DOM.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => refreshVision(true)}
                  disabled={isCapturing}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition active:scale-95"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  Capturar Novo
                </button>
              </div>

              {/* Botões de Perguntas Rápidas */}
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Perguntar à Gemini Vision sobre esta tela:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleAskGemini(q)}
                      disabled={isAnalyzing}
                      className="text-xs px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-cyan-500/20 hover:text-cyan-300 text-slate-300 border border-slate-700/80 transition active:scale-95 disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Campo de Pergunta Personalizada */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (userQuery.trim()) {
                    handleAskGemini(userQuery.trim());
                  }
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Faça uma pergunta específica sobre o que está na tela..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isAnalyzing || !userQuery.trim()}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition disabled:opacity-50 active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Perguntar
                </button>
              </form>

              {/* Resposta da Gemini Vision */}
              {isAnalyzing && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-300">
                    Gemini Vision analisando a imagem da tela e os elementos do DOM...
                  </p>
                </div>
              )}

              {geminiAnswer && !isAnalyzing && (
                <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/30 text-slate-200 text-xs leading-relaxed space-y-2">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-[11px] uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Resposta da Gemini Vision:
                  </div>
                  <div className="whitespace-pre-wrap font-sans text-slate-200">
                    {geminiAnswer}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ABA 2: ELEMENTOS IDENTIFICADOS */}
          {activeTab === 'elements' && (
            <div className="space-y-3">
              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {['all', 'input', 'button', 'link', 'menu', 'image'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTypeFilter(t)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg transition ${
                        selectedTypeFilter === t
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      {t === 'all' ? 'Todos' : t}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filtrar por ID ou texto..."
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Lista de Elementos */}
              <div className="space-y-1.5 max-h-[50vh] overflow-y-auto pr-1">
                {filteredElements.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-6">
                    Nenhum elemento encontrado com estes filtros.
                  </p>
                ) : (
                  filteredElements.map((el) => (
                    <div
                      key={el.id}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-bold text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/50">
                            {el.id}
                          </code>
                          <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                            {el.type}
                          </span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              el.visible
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {el.visible ? 'Visível' : 'Oculto'}
                          </span>
                          {el.disabled && (
                            <span className="text-[10px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded">
                              Desativado
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-200 font-medium">
                          {el.text || el.placeholder ? (
                            <span>
                              {el.text} {el.placeholder && <span className="text-slate-400 font-normal">({el.placeholder})</span>}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">Sem texto textual direto</span>
                          )}
                        </div>

                        {el.href && (
                          <p className="text-[11px] text-cyan-400/80 truncate max-w-md">
                            href: {el.href}
                          </p>
                        )}
                      </div>

                      {/* Coordenadas e Dimensões */}
                      <div className="text-[11px] text-slate-400 sm:text-right shrink-0">
                        <div>
                          X: <span className="text-slate-200">{el.x}px</span> | Y: <span className="text-slate-200">{el.y}px</span>
                        </div>
                        <div>
                          L: <span className="text-slate-200">{el.width}px</span> × A: <span className="text-slate-200">{el.height}px</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ABA 3: DEBUG & JSON */}
          {activeTab === 'debug' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Estrutura JSON do BrowserVision
                </span>
                <button
                  onClick={copyJson}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition active:scale-95"
                >
                  {copiedJson ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      Copiar JSON
                    </>
                  )}
                </button>
              </div>

              {/* Console log preview */}
              <div className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 border border-slate-800 space-y-1">
                <div>[BrowserVision] URL: {snapshot?.page.url}</div>
                <div>[BrowserVision] Título: {snapshot?.page.title}</div>
                <div>[BrowserVision] Elementos encontrados: {snapshot?.elements.length || 0}</div>
                <div>[BrowserVision] Textos encontrados: {snapshot?.headings.length || 0} títulos, {snapshot?.visibleText.length || 0} caracteres</div>
                <div>[BrowserVision] Screenshot disponível: {snapshot?.screenshotAvailable ? 'Sim' : 'Não'}</div>
              </div>

              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 max-h-[42vh] overflow-y-auto">
                {JSON.stringify(
                  {
                    page: snapshot?.page,
                    elementsCount: snapshot?.elements.length,
                    headings: snapshot?.headings,
                    visibleTextPreview: snapshot?.visibleText.slice(0, 300) + '...',
                    screenshotAvailable: snapshot?.screenshotAvailable,
                    sampleElements: snapshot?.elements.slice(0, 5),
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          )}
        </div>

        {/* Rodapé informativo */}
        <div className="px-4 py-2.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-cyan-400" />
            Nenhuma ação executada: os Olhos apenas observam e mapeiam.
          </span>
          <span>
            {snapshot?.elements.length || 0} elementos mapeados
          </span>
        </div>
      </div>
    </div>
  );
};
