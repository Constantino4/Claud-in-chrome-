import React from 'react';
import { ShieldAlert, AlertTriangle, Check, X } from 'lucide-react';
import { SensitiveConfirmation } from '../types/browser';

interface ConfirmationModalProps {
  confirmation: SensitiveConfirmation | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  confirmation,
  onConfirm,
  onCancel,
}) => {
  if (!confirmation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
        {/* Warning Icon and Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              Ação Sensível Detectada
            </span>
            <h3 className="text-sm font-bold text-slate-100 leading-tight">
              {confirmation.title}
            </h3>
          </div>
        </div>

        {/* Description Prompt */}
        <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-2">
          <p className="font-semibold text-amber-200">
            "Esta ação precisa da sua confirmação."
          </p>
          <p className="text-slate-400 text-[11px]">
            {confirmation.description}
          </p>
        </div>

        {/* Buttons: Cancelar / Confirmar */}
        <div className="flex gap-2.5 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <X className="w-4 h-4 text-slate-400" />
            Cancelar
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-orange-900/30 transition active:scale-95"
          >
            <Check className="w-4 h-4 text-white" />
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};
