import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Square,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  HelpCircle,
  Languages,
  Search,
  Scale,
  Play,
  AlertTriangle,
  CheckCircle2,
  Table,
  Check,
  Bot,
  User,
} from 'lucide-react';
import { AgentMessage, AgentStepLog } from '../types/browser';
import { voiceService } from '../services/VoiceService';

interface AIBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  messages: AgentMessage[];
  stepLogs: AgentStepLog[];
  isRunning: boolean;
  lastError: { goal: string } | null;
  onSubmitGoal: (goal: string) => void;
  onStop: () => void;
  onRetry: () => void;
  onClear: () => void;
}

export const AIBottomSheet: React.FC<AIBottomSheetProps> = ({
  isOpen,
  onClose,
  messages,
  stepLogs,
  isRunning,
  lastError,
  onSubmitGoal,
  onStop,
  onRetry,
  onClear,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rola até o final das mensagens automaticamente
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, stepLogs, isRunning]);

  if (!isOpen) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
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
        (error) => {
          console.warn('Voice error:', error);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
      setIsListening(started);
    }
  };

  const handleQuickAction = (actionText: string) => {
    onSubmitGoal(actionText);
  };

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-50 flex flex-col bg-slate-900 border-t border-indigo-500/30 rounded-t-3xl shadow-2xl transition-all duration-300 ${
        isExpanded ? 'h-[85vh]' : 'h-[58vh]'
      }`}
    >
      {/* Top Handle and Header */}
      <div className="px-4 pt-2.5 pb-2 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/80 rounded-t-3xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              Morph AI Agent
              {isRunning && (
                <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-normal">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  Executando na página...
                </span>
              )}
            </h2>
            <p className="text-[10px] text-slate-400">Compreensão da página e execução de tarefas</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isRunning && (
            <button
              onClick={onStop}
              aria-label="Parar agente"
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow-md shadow-rose-900/40 active:scale-95 transition mr-1 animate-pulse"
            >
              <Square className="w-3 h-3 fill-white" />
              Parar agente
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label="Expandir ou reduzir"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            aria-label="Fechar painel"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Actions Scroll Bar (Requirement #2) */}
      <div className="px-3 py-1.5 bg-slate-950/40 border-b border-slate-800/60 flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
        <button
          onClick={() => handleQuickAction('Resume esta página.')}
          disabled={isRunning}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium whitespace-nowrap active:scale-95 transition disabled:opacity-40"
        >
          <FileText className="w-3 h-3 text-cyan-400" />
          Resumir
        </button>
        <button
          onClick={() => handleQuickAction('Explica o que está nesta página.')}
          disabled={isRunning}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium whitespace-nowrap active:scale-95 transition disabled:opacity-40"
        >
          <HelpCircle className="w-3 h-3 text-indigo-400" />
          Explicar
        </button>
        <button
          onClick={() => handleQuickAction('Encontra o preço deste produto ou celulares baratos.')}
          disabled={isRunning}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium whitespace-nowrap active:scale-95 transition disabled:opacity-40"
        >
          <Search className="w-3 h-3 text-emerald-400" />
          Encontrar Preço
        </button>
        <button
          onClick={() => handleQuickAction('Pesquisa três celulares baratos e compara os preços em tabela.')}
          disabled={isRunning}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium whitespace-nowrap active:scale-95 transition disabled:opacity-40"
        >
          <Scale className="w-3 h-3 text-purple-400" />
          Comparar
        </button>
        <button
          onClick={() => handleQuickAction('Preenche este formulário com os dados padrão.')}
          disabled={isRunning}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium whitespace-nowrap active:scale-95 transition disabled:opacity-40"
        >
          <Languages className="w-3 h-3 text-amber-400" />
          Preencher Formulário
        </button>
        <button
          onClick={() => handleQuickAction('Continuar tarefa atual e encontrar próximos detalhes.')}
          disabled={isRunning}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium whitespace-nowrap active:scale-95 transition disabled:opacity-40"
        >
          <Play className="w-3 h-3 text-pink-400" />
          Continuar Tarefa
        </button>
      </div>

      {/* Activity Area (Requirement #13) */}
      {stepLogs.length > 0 && (
        <div className="mx-3 my-2 p-2.5 bg-slate-950/90 border border-indigo-500/20 rounded-xl shrink-0 max-h-36 overflow-y-auto space-y-1.5 shadow-inner">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between pb-1 border-b border-slate-800/80">
            <span>Atividade do Agente em Tempo Real</span>
            {isRunning && <span className="text-cyan-400 animate-pulse text-[10px]">Trabalhando...</span>}
          </div>
          {stepLogs.map((log) => (
            <div key={log.id} className="flex items-start gap-1.5 text-xs text-slate-200">
              <span className="shrink-0">{log.icon}</span>
              <div className="flex-1 min-w-0">
                <span
                  className={
                    log.status === 'completed'
                      ? 'text-emerald-300 font-medium'
                      : log.status === 'failed'
                      ? 'text-rose-400 font-medium'
                      : log.status === 'requires_confirmation'
                      ? 'text-amber-400 font-semibold'
                      : 'text-cyan-300'
                  }
                >
                  {log.text}
                </span>
                {log.detail && (
                  <p className="text-[10px] text-slate-400 truncate">{log.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[90%] p-3 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-sm shadow-md'
                  : msg.role === 'system'
                  ? 'bg-slate-800/90 border border-slate-700 text-slate-300 rounded-tl-sm'
                  : 'bg-slate-800/95 border border-slate-700/80 text-slate-100 rounded-tl-sm shadow-md'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px] opacity-70">
                {msg.role === 'user' ? (
                  <>
                    <span>Você</span>
                    <User className="w-3 h-3" />
                  </>
                ) : (
                  <>
                    <Bot className="w-3 h-3 text-cyan-400" />
                    <span className="font-semibold text-cyan-300">Morph Agent</span>
                  </>
                )}
              </div>

              {/* Text formatting with bold support */}
              <div className="whitespace-pre-wrap space-y-1">
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

              {/* Comparison Table (Requirement #3) */}
              {msg.comparisonTable && (
                <div className="mt-3 overflow-x-auto rounded-xl border border-slate-700 bg-slate-900/90 p-2">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 mb-1.5">
                    <Table className="w-3.5 h-3.5" />
                    <span>Tabela Comparativa Extraída</span>
                  </div>
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-300">
                        {msg.comparisonTable.headers.map((h, i) => (
                          <th key={i} className="py-1 px-1.5 font-bold">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {msg.comparisonTable.rows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="border-b border-slate-800 hover:bg-slate-800/40 text-slate-200"
                        >
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="py-1.5 px-1.5">
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
        ))}

        {/* Error Notification with Retry (Requirement #15) */}
        {lastError && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-2xl space-y-2 text-xs text-rose-200 animate-fade-in">
            <div className="flex items-center gap-1.5 font-bold text-rose-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Não consegui executar esta ação</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Ocorreu uma falha durante o processo. Deseja que o agente tente novamente ou prefere interromper?
            </p>
            <div className="flex gap-2 pt-1">
              <button
                onClick={onRetry}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 rounded-xl text-xs font-semibold text-white flex items-center gap-1 shadow transition active:scale-95"
              >
                <RotateCcw className="w-3 h-3" />
                TENTAR NOVAMENTE
              </button>
              <button
                onClick={onStop}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-300 transition active:scale-95"
              >
                PARAR
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box and Voice (Requirement #12) */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/95 shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={toggleVoice}
            aria-label="Comando de voz"
            className={`p-2.5 rounded-xl border transition active:scale-90 ${
              isListening
                ? 'bg-rose-600 border-rose-500 text-white animate-pulse'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isRunning}
            placeholder={
              isListening
                ? 'Ouvindo sua voz...'
                : 'Comande a IA (ex: "Compara celulares baratos", "Resume")...'
            }
            className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isRunning}
            aria-label="Enviar comando"
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 rounded-xl text-white transition active:scale-90 shadow-md shadow-indigo-600/30 flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
