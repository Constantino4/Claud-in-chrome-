import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  MoreVertical,
  Plus,
  Send,
  Square,
  Mic,
  MicOff,
  Globe,
  Paperclip,
  Image as ImageIcon,
  FileText,
  ChevronDown,
  ChevronUp,
  Table,
  Check,
  CheckCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Bot,
  ExternalLink,
  Eye,
  Search,
  Copy,
  ShieldCheck,
  Smartphone,
  ListOrdered,
} from 'lucide-react';
import { AgentMessage, AgentStepLog, PageSnapshot } from '../types/browser';
import { voiceService } from '../services/VoiceService';
import { browserController } from '../services/BrowserController';

interface ChatMainViewProps {
  messages: AgentMessage[];
  stepLogs: AgentStepLog[];
  isRunning: boolean;
  lastError: { goal: string } | null;
  currentSnapshot?: PageSnapshot;
  onOpenSidebar: () => void;
  onOpenBrowser: () => void;
  onOpenSettings: () => void;
  onOpenVision?: () => void;
  onSubmitGoal: (goal: string) => void;
  onStop: () => void;
  onRetry: () => void;
  onClearChat: () => void;
  theme: 'dark' | 'light';
}

export const ChatMainView: React.FC<ChatMainViewProps> = ({
  messages,
  stepLogs,
  isRunning,
  lastError,
  currentSnapshot,
  onOpenSidebar,
  onOpenBrowser,
  onOpenSettings,
  onOpenVision,
  onSubmitGoal,
  onStop,
  onRetry,
  onClearChat,
  theme,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [isActivityExpanded, setIsActivityExpanded] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({});

  const togglePlanExpanded = (msgId: string) => {
    setExpandedPlans((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, stepLogs, isRunning]);

  // Ajusta altura do textarea automaticamente ao digitar
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputText]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    onSubmitGoal(text);
  };

  const toggleVoice = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      const started = voiceService.startListening(
        (transcript) => {
          setInputText(transcript);
        },
        () => setIsListening(false),
        () => setIsListening(false)
      );
      setIsListening(started);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setInputText(examplePrompt);
    textareaRef.current?.focus();
  };

  const handleAttach = (type: 'file' | 'image' | 'page') => {
    setIsAttachmentOpen(false);
    if (type === 'page' && currentSnapshot) {
      setInputText((prev) =>
        prev
          ? `${prev} (Página atual: ${currentSnapshot.title} - ${currentSnapshot.url})`
          : `Resume e explica o que está na página atual: "${currentSnapshot.title}" (${currentSnapshot.url})`
      );
      textareaRef.current?.focus();
    } else if (type === 'image') {
      setInputText((prev) => `${prev} [Anexo de imagem solicitado] `);
    } else {
      setInputText((prev) => `${prev} [Arquivo anexado] `);
    }
  };

  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const suggestions = [
    {
      title: '🎯 Comparação Autónoma (< $300)',
      prompt: 'Procura os melhores telemóveis Samsung abaixo de 300 dólares e compara os preços.',
    },
    {
      title: '🇲🇿 Capital de Moçambique (Direct)',
      prompt: 'Qual é a capital de Moçambique?',
    },
    {
      title: '🔍 Pesquisa Samsung S25',
      prompt: 'Pesquisa Samsung Galaxy S25',
    },
    {
      title: '🌐 Site oficial da Samsung',
      prompt: 'Encontra o site oficial da Samsung',
    },
    {
      title: '🎲 Apostas em Moçambique',
      prompt: 'Encontra plataformas de apostas em Moçambique',
    },
    {
      title: '🤖 Browser Agent (Interação)',
      prompt: 'Abre o site da Samsung e procura Galaxy S25',
    },
  ];

  // Identifica último status da atividade
  const latestLog = stepLogs.length > 0 ? stepLogs[stepLogs.length - 1] : null;

  return (
    <div className={`flex-1 flex flex-col h-full relative overflow-hidden select-text ${
      theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* 1. BARRA SUPERIOR COMPACTA (Requirement #2) */}
      <header className="h-13 border-b border-slate-800/80 px-3.5 flex items-center justify-between shrink-0 bg-slate-950/90 backdrop-blur-md z-30">
        <div className="flex items-center gap-2">
          {/* Botão de menu hamburguer ☰ */}
          <button
            onClick={onOpenSidebar}
            aria-label="Abrir menu"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-850 active:scale-90 transition"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Nome e identidade própria do app */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-100">
              Morph Browser AI
            </span>
          </div>
        </div>

        {/* Lado Direito: Indicador de Navegador e Menu ⋯ */}
        <div className="flex items-center gap-2">
          {/* Indicador quando o navegador está ativo / botão 'Ver navegador' */}
          <button
            onClick={onOpenBrowser}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 border ${
              isRunning
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300 animate-pulse shadow-sm shadow-cyan-900/40'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isRunning ? 'Navegador ativo' : 'Ver navegador'}</span>
          </button>

          {/* Browser Vision (Olhos da IA) */}
          {onOpenVision && (
            <button
              onClick={onOpenVision}
              className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 border bg-cyan-950/60 border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 shadow-sm"
              title="Browser Vision (Olhos da IA)"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Olhos</span>
            </button>
          )}

          {/* Menu de opções ⋯ */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Mais opções"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-2xl z-50 animate-fade-in text-xs space-y-0.5">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenBrowser();
                  }}
                  className="w-full px-2.5 py-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                >
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  Abrir Navegador
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onClearChat();
                  }}
                  className="w-full px-2.5 py-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  Limpar Conversa
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full px-2.5 py-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Configurações
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. ÁREA PRINCIPAL DA CONVERSA (Requirement #4 & #5) */}
      <main className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none flex flex-col items-center">
        <div className="w-full max-w-2xl flex-1 flex flex-col justify-between">
          {/* TELA INICIAL LIMPA QUANDO NÃO EXISTIR CONVERSA */}
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-10 my-auto animate-fade-in">
              {/* Logo / Marca do Morph */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-600/30 mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>

              <h1 className="text-xl font-bold text-slate-100 tracking-tight mb-1">
                Morph Browser AI
              </h1>
              <p className="text-sm font-medium text-slate-400 mb-8">
                O que você quer fazer?
              </p>

              {/* Exemplos clicáveis */}
              <div className="w-full max-w-md grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {suggestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleClick(item.prompt)}
                    className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white transition active:scale-95 shadow-sm text-left group"
                  >
                    <span className="font-semibold block text-slate-200 group-hover:text-cyan-300">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate block mt-0.5">
                      {item.prompt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* STREAM DE MENSAGENS ESTILO CHAT MODERNO */
            <div className="space-y-5 pb-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  } animate-fade-in`}
                >
                  {/* Mensagem do Usuário (Discreta e sem bolha gigante - Req #9) */}
                  {msg.role === 'user' ? (
                    <div className="max-w-[85%] sm:max-w-[75%] px-4 py-2.5 rounded-2xl bg-slate-800 text-slate-100 text-xs sm:text-sm leading-relaxed shadow-sm border border-slate-700/60 break-words">
                      {msg.content}
                    </div>
                  ) : (
                    /* Mensagem da IA (Natural de assistente - Req #10) */
                    <div className="w-full flex items-start gap-3">
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/20 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                      </div>

                      <div className="flex-1 min-w-0 space-y-3">
                        {/* Indicador / Badge do Decisor */}
                        {msg.decision && (
                          <div className="flex flex-wrap items-center gap-2 pt-0.5">
                            {msg.decision.type === 'autonomous_plan' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shadow-sm shadow-emerald-900/30">
                                <Bot className="w-3 h-3 text-emerald-400" />
                                Orquestrador Autónomo • Task Planner
                              </span>
                            )}
                            {msg.decision.type === 'web_search' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                                <Search className="w-3 h-3 text-cyan-400" />
                                Web Search Tool • Resultados Reais
                              </span>
                            )}
                            {msg.decision.type === 'browser_agent' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-950/80 border border-purple-500/40 text-purple-300">
                                <Globe className="w-3 h-3 text-purple-400" />
                                Browser Agent • Arquitetura Modular
                              </span>
                            )}
                            {msg.decision.type === 'direct_answer' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800/80 border border-slate-700 text-slate-300">
                                <Sparkles className="w-3 h-3 text-cyan-400" />
                                Resposta Direta Factual
                              </span>
                            )}
                          </div>
                        )}

                        {/* PLANO DE EXECUÇÃO AUTÓNOMO (TASK PLANNER) */}
                        {msg.plan && msg.plan.steps && (
                          <div className="mt-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 overflow-hidden shadow-sm">
                            <div
                              onClick={() => togglePlanExpanded(msg.id)}
                              className="px-3.5 py-2.5 flex items-center justify-between cursor-pointer hover:bg-emerald-900/20 transition select-none"
                            >
                              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                                <ListOrdered className="w-4 h-4 text-emerald-400" />
                                <span>Plano Autónomo do Agente ({msg.plan.steps.length} Etapas)</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                                <span>{expandedPlans[msg.id] ? 'Recolher plano' : 'Ver 9 etapas'}</span>
                                {expandedPlans[msg.id] ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </div>
                            </div>

                            {expandedPlans[msg.id] && (
                              <div className="px-3.5 pb-3 pt-1 border-t border-emerald-500/20 space-y-2 text-xs">
                                {msg.plan.steps.map((st) => (
                                  <div
                                    key={st.id}
                                    className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 space-y-1"
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                                        <span className="w-4 h-4 rounded-full bg-emerald-900/60 text-emerald-300 text-[10px] flex items-center justify-center font-bold">
                                          {st.stepNumber}
                                        </span>
                                        {st.title}
                                      </span>
                                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 font-mono text-cyan-300">
                                        {st.tool}
                                      </span>
                                    </div>
                                    {st.actionDescription && (
                                      <p className="text-[11px] text-slate-400 pl-5">
                                        <span className="text-slate-500">Ação:</span> {st.actionDescription}
                                      </p>
                                    )}
                                    {st.observation && (
                                      <p className="text-[11px] text-emerald-400/90 pl-5">
                                        <span className="text-slate-500">Observação:</span> {st.observation}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* VERIFICAÇÃO E AUDITORIA DE REGRAS */}
                        {msg.verificationLogs && msg.verificationLogs.length > 0 && (
                          <div className="mt-2.5 p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-cyan-200 space-y-2">
                            <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                              <ShieldCheck className="w-4 h-4 text-cyan-400" />
                              <span>Camada de Verificação Ativa (Critérios Auditados)</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                              {msg.verificationLogs.map((v, vIdx) => (
                                <div
                                  key={vIdx}
                                  className="p-2 rounded-xl bg-slate-900/70 border border-slate-800 flex items-start gap-2"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <div>
                                    <div className="font-semibold text-slate-200">
                                      {v.step}: <span className="text-cyan-300">{v.check}</span>
                                    </div>
                                    <p className="text-slate-400 text-[10px] mt-0.5 leading-tight">{v.detail}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* PRODUTOS EXTRAÍDOS (SHOWCASE DE CARDS) */}
                        {msg.extractedProducts && msg.extractedProducts.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-200 px-1">
                              <span className="flex items-center gap-1.5 text-cyan-400">
                                <Smartphone className="w-3.5 h-3.5" />
                                Modelos Extraídos & Validados ({msg.extractedProducts.length})
                              </span>
                              <span className="text-[11px] text-emerald-400 font-mono">
                                Todos &lt; $300 USD
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {msg.extractedProducts.map((prod) => (
                                <div
                                  key={prod.id}
                                  className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition shadow-sm space-y-2"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-100 leading-snug">
                                      {prod.model}
                                    </h4>
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-300 shrink-0">
                                      {prod.priceFormatted}
                                    </span>
                                  </div>

                                  {prod.highlight && (
                                    <div className="text-[11px] font-semibold text-cyan-300/90 bg-cyan-950/40 px-2 py-1 rounded-lg border border-cyan-500/20">
                                      {prod.highlight}
                                    </div>
                                  )}

                                  <p className="text-[11px] text-slate-300 leading-relaxed">
                                    {prod.specs}
                                  </p>

                                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                                    <span className="text-slate-400">
                                      Fonte: <strong className="text-slate-300">{prod.store}</strong>
                                    </span>
                                    <a
                                      href={prod.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                                    >
                                      Ver na loja <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="text-xs sm:text-sm leading-relaxed text-slate-200 space-y-1.5 break-words">
                          {msg.content.split('\n').map((paragraph, pIdx) => (
                            <p key={pIdx}>
                              {paragraph.split('**').map((part, bIdx) =>
                                bIdx % 2 === 1 ? (
                                  <strong key={bIdx} className="font-bold text-white">
                                    {part}
                                  </strong>
                                ) : (
                                  part
                                )
                              )}
                            </p>
                          ))}
                        </div>

                        {/* RESULTADOS REAIS DA WEB (Cards com links clicáveis) */}
                        {msg.searchResults && msg.searchResults.length > 0 && (
                          <div className="mt-3.5 space-y-2.5">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 px-1">
                              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                                <Globe className="w-3.5 h-3.5" />
                                Resultados Reais Encontrados ({msg.searchResults.length})
                              </span>
                              <span className="text-[11px] text-slate-500 font-normal">
                                Links externos reais
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-2.5">
                              {msg.searchResults.map((res, rIdx) => (
                                <div
                                  key={rIdx}
                                  data-vision-id={`RESULT_CARD_${rIdx}`}
                                  onClick={() => browserController.openUrl(res.url, true)}
                                  className="p-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-850/90 border border-slate-800 hover:border-cyan-500/40 transition-all shadow-sm group cursor-pointer"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <button
                                      type="button"
                                      data-vision-id={`RESULT_LINK_${rIdx}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        browserController.openUrl(res.url, true);
                                      }}
                                      className="font-semibold text-xs sm:text-sm text-cyan-300 hover:text-cyan-200 hover:underline flex items-center gap-1.5 leading-snug text-left"
                                    >
                                      <span>{res.title}</span>
                                      <Globe className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 text-cyan-400" />
                                    </button>

                                    <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                                      {res.source && (
                                        <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                                          {res.source}
                                        </span>
                                      )}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopyUrl(res.url);
                                        }}
                                        title="Copiar link"
                                        className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
                                      >
                                        {copiedUrl === res.url ? (
                                          <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                          <Copy className="w-3.5 h-3.5" />
                                        )}
                                      </button>
                                    </div>
                                  </div>

                                  <p className="text-xs text-slate-300/90 mt-1.5 leading-relaxed">
                                    {res.snippet}
                                  </p>

                                  <div className="mt-2 pt-2 border-t border-slate-850/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                                    <span className="truncate max-w-[70%]">{res.url}</span>
                                    <button
                                      type="button"
                                      data-vision-id={`BTN_OPEN_RESULT_${rIdx}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        browserController.openUrl(res.url, true);
                                      }}
                                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-sans font-semibold flex items-center gap-1 text-[11px] transition active:scale-95"
                                    >
                                      Abrir no Navegador <ExternalLink className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* AÇÃO DO BROWSER AGENT - BOTÃO DIRETO PARA O NAVEGADOR */}
                        {msg.decision?.type === 'browser_agent' && (
                          <div className="mt-3 p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/30 border border-cyan-500/30 text-xs text-cyan-200 flex items-center justify-between gap-3 shadow-sm">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                                <Globe className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-100 truncate text-xs">
                                  {msg.decision.siteName || msg.decision.targetAction || 'Página Aberta'}
                                </div>
                                <div className="text-[11px] text-cyan-300/80 font-mono truncate">
                                  {msg.decision.targetUrl || ''}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={onOpenBrowser}
                              className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shrink-0 transition active:scale-95 shadow-md shadow-cyan-500/20"
                            >
                              Ver Navegador <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Tabela de Comparação quando gerada */}
                        {msg.comparisonTable && (
                          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/90 p-3 shadow-inner">
                            <div className="flex items-center justify-between text-xs font-bold text-cyan-400 mb-2">
                              <span className="flex items-center gap-1.5">
                                <Table className="w-4 h-4" />
                                Comparação Detalhada
                              </span>
                              <button
                                onClick={onOpenBrowser}
                                className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 font-normal"
                              >
                                Ver na loja <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                            <table className="w-full text-left border-collapse text-xs">
                              <thead>
                                <tr className="border-b border-slate-800 text-slate-400">
                                  {msg.comparisonTable.headers.map((h, i) => (
                                    <th key={i} className="py-1.5 px-2 font-semibold">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {msg.comparisonTable.rows.map((row, rIdx) => (
                                  <tr
                                    key={rIdx}
                                    className="border-b border-slate-850 hover:bg-slate-850/50 text-slate-200"
                                  >
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx} className="py-2 px-2">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* 3. ATIVIDADE DO AGENTE EXPANSÍVEL (Requirement #6) */}
              {(stepLogs.length > 0 || isRunning) && (
                <div className="w-full pl-10 pr-2">
                  <div className="rounded-2xl bg-slate-900/90 border border-slate-800/80 overflow-hidden shadow-sm transition-all">
                    {/* Linha Resumo da Atividade */}
                    <div
                      onClick={() => setIsActivityExpanded(!isActivityExpanded)}
                      className="px-3.5 py-2 flex items-center justify-between cursor-pointer hover:bg-slate-850 transition select-none"
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <span className={isRunning ? 'text-cyan-400' : lastError ? 'text-rose-400' : 'text-emerald-400'}>
                          {isRunning ? '◌' : lastError ? '✗' : '✓'}
                        </span>
                        <span className="font-semibold text-slate-200">
                          {isRunning
                            ? (latestLog?.text || 'A pesquisar...')
                            : lastError
                            ? 'Ação não concluída'
                            : 'Pesquisa e análise concluídas'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-[11px]">Decisor & Atividade</span>
                        {isActivityExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </div>
                    </div>

                    {/* Passos de Alto Nível Realizados (Quando aberto) */}
                    {isActivityExpanded && (
                      <div className="px-3.5 pb-3 pt-1 space-y-1.5 border-t border-slate-800/60 bg-slate-950/40 text-xs">
                        {stepLogs.map((log) => (
                          <div key={log.id} className="flex items-center gap-2 text-slate-300">
                            <span className="text-slate-400 text-[11px] shrink-0">
                              {log.status === 'completed' ? '✓' : '◌'}
                            </span>
                            <span className="truncate">{log.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Erro com Retry */}
              {lastError && (
                <div className="w-full pl-10 pr-2">
                  <div className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-2xl text-xs text-rose-200 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Não consegui concluir a tarefa. Deseja tentar novamente?</span>
                    </div>
                    <button
                      onClick={onRetry}
                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow transition"
                    >
                      <RotateCcw className="w-3 h-3" /> Tentar
                    </button>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* 4. CAMPO DE MENSAGEM ESTILO CHAT MODERNO FIXADO (Requirement #7 & #8) */}
      <footer className="p-3 pb-5 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent shrink-0 flex justify-center z-20">
        <div className="w-full max-w-2xl relative">
          {/* Menu Popup do Botão de Anexo (+) */}
          {isAttachmentOpen && (
            <div className="absolute bottom-16 left-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-2xl z-30 animate-fade-in text-xs space-y-0.5">
              <button
                onClick={() => handleAttach('page')}
                className="w-full px-2.5 py-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                Página atual
              </button>
              <button
                onClick={() => handleAttach('image')}
                className="w-full px-2.5 py-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
              >
                <ImageIcon className="w-3.5 h-3.5 text-purple-400" />
                Imagem
              </button>
              <button
                onClick={() => handleAttach('file')}
                className="w-full px-2.5 py-2 rounded-xl text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                Arquivo
              </button>
            </div>
          )}

          {/* Container Pill de Mensagem */}
          <form
            onSubmit={handleSend}
            className="w-full bg-slate-900/95 border border-slate-800 hover:border-slate-700 focus-within:border-indigo-500/80 rounded-3xl p-1.5 pl-2.5 flex items-end gap-1.5 shadow-xl transition-all"
          >
            {/* Botão de Anexo (+) */}
            <button
              type="button"
              onClick={() => setIsAttachmentOpen(!isAttachmentOpen)}
              aria-label="Anexar conteúdo"
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-90 shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>

            {/* Textarea com auto-expansão */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isRunning}
              placeholder={isListening ? 'Ouvindo sua voz...' : 'O que você quer fazer?'}
              className="flex-1 bg-transparent text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none py-2 px-1 max-h-36 leading-relaxed"
            />

            {/* Botão de voz discreto */}
            <button
              type="button"
              onClick={toggleVoice}
              aria-label="Voz"
              className={`p-2 rounded-full transition active:scale-90 shrink-0 ${
                isListening
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Botão Enviar (Muda para PARAR durante tarefa - Req #7) */}
            {isRunning ? (
              <button
                type="button"
                onClick={onStop}
                aria-label="Parar agente"
                className="p-2 px-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-900/40 active:scale-95 transition shrink-0 animate-pulse"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                <span className="hidden sm:inline">Parar</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputText.trim()}
                aria-label="Enviar"
                className="p-2 rounded-full bg-slate-100 hover:bg-white text-slate-950 disabled:opacity-30 disabled:hover:bg-slate-100 transition active:scale-90 shrink-0 shadow-md flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Micro aviso de segurança discreto */}
          <div className="text-[10px] text-slate-500 text-center mt-1.5 font-medium">
            Morph Browser AI pode interagir e navegar em páginas web para cumprir seus pedidos.
          </div>
        </div>
      </footer>
    </div>
  );
};
