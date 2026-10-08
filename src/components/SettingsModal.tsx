import React from 'react';
import { Settings, Moon, Sun, Volume2, Smartphone, Shield, X, Search, Check } from 'lucide-react';
import { AppSettings } from '../services/SettingsManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (partial: Partial<AppSettings>) => void;
  onOpenPrivacy: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenPrivacy,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 p-4 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Settings className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">Configurações do Navegador</h2>
            <p className="text-[11px] text-slate-400">Personalize a experiência do Morph Browser AI</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Settings list */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 max-w-lg mx-auto w-full text-xs">
        {/* Toggle Moldura de Celular Android */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100">Visualização em Moldura Android</h4>
              <p className="text-[11px] text-slate-400">Alternar entre mockup de smartphone e tela cheia</p>
            </div>
          </div>

          <button
            onClick={() => onUpdateSettings({ showDeviceFrame: !settings.showDeviceFrame })}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
              settings.showDeviceFrame ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.showDeviceFrame ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Resposta por Voz (TTS) */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-950 text-purple-400 border border-purple-800/40">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100">Leitura em Voz Alta (TTS)</h4>
              <p className="text-[11px] text-slate-400">A IA lê os resumos e respostas automaticamente</p>
            </div>
          </div>

          <button
            onClick={() => onUpdateSettings({ voiceReadback: !settings.voiceReadback })}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
              settings.voiceReadback ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.voiceReadback ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Confirmação Estrita para Ações Sensíveis */}
        <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/40">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100">Confirmação Obrigatória</h4>
              <p className="text-[11px] text-slate-400">Sempre pedir autorização antes de compras ou envios</p>
            </div>
          </div>

          <button
            onClick={() => onUpdateSettings({ requireConfirmation: !settings.requireConfirmation })}
            className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
              settings.requireConfirmation ? 'bg-indigo-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.requireConfirmation ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Link para Política de Privacidade */}
        <div
          onClick={() => {
            onClose();
            onOpenPrivacy();
          }}
          className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer transition group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/40">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 group-hover:text-emerald-300">
                Central de Privacidade & Dados
              </h4>
              <p className="text-[11px] text-slate-400">O que é enviado, proteção de senhas e exclusão</p>
            </div>
          </div>

          <span className="text-xs text-indigo-400 font-semibold group-hover:translate-x-1 transition">
            Abrir →
          </span>
        </div>

        {/* Versão e Créditos */}
        <div className="pt-6 text-center text-slate-500 space-y-1">
          <p className="font-bold text-slate-400">Morph Browser AI • Versão 1.0.0</p>
          <p className="text-[11px]">Navegador Android com Agente Autônomo e Sandbox Seguro</p>
        </div>
      </div>
    </div>
  );
};
