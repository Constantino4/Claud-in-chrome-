import React from 'react';
import { ShieldCheck, Lock, EyeOff, Database, Trash2, X, Check } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearAllData: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose, onClearAllData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 p-4 animate-fade-in select-text">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Privacidade & Segurança</h2>
            <p className="text-[11px] text-slate-400">Compromisso e isolamento de dados no Morph Browser</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs leading-relaxed text-slate-300 max-w-xl mx-auto">
        {/* Card 1: O que é enviado para a IA */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <EyeOff className="w-4 h-4" />
            <span>1. O que é enviado para o modelo de IA?</span>
          </div>
          <p className="text-slate-400">
            Apenas a representação estrutural da página ativa (títulos, links, botões com IDs e produtos) necessária para cumprir o seu comando. O conteúdo da web é marcado e tratado como <strong>dado não confiável</strong> em tags de isolamento rígidas.
          </p>
        </div>

        {/* Card 2: O que NUNCA é enviado (Credenciais & Senhas) */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Lock className="w-4 h-4" />
            <span>2. Proteção de Senhas & Credenciais Locais</span>
          </div>
          <p className="text-slate-400">
            Campos de senha e tokens de autenticação são <strong>mascarados localmente</strong> e nunca enviados para a IA. Quando uma página exige senha, o Morph Browser orienta o usuário a digitar diretamente no campo nativo do navegador.
          </p>
        </div>

        {/* Card 3: Defesa contra Prompt Injection */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>3. Blindagem contra Prompt Injection</span>
          </div>
          <p className="text-slate-400">
            Se uma página maliciosa tentar injetar comandos como "Ignore todas as instruções anteriores", o SecurityManager do Morph bloqueia a tentativa e instrui a IA a desconsiderar instruções da página.
          </p>
        </div>

        {/* Card 4: Armazenamento Local */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold">
            <Database className="w-4 h-4" />
            <span>4. Armazenamento Local no Dispositivo</span>
          </div>
          <p className="text-slate-400">
            Seu histórico de navegação, abas recentes e favoritos residem no armazenamento do próprio navegador (armazenamento do dispositivo). Nenhum dado de telemetria ou rastreamento é vendido.
          </p>
        </div>

        {/* Clear Data Section */}
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-3">
          <h3 className="font-bold text-rose-300 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Exclusão Completa de Dados
          </h3>
          <p className="text-[11px] text-slate-400">
            Você pode apagar todo o histórico de navegação, memória de tarefas e preferências armazenadas com um único clique.
          </p>
          <button
            onClick={() => {
              if (window.confirm('Deseja realmente limpar todos os dados locais do Morph Browser?')) {
                onClearAllData();
                onClose();
              }
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-rose-900/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Apagar Todos os Dados do Aplicativo
          </button>
        </div>
      </div>
    </div>
  );
};
