import React, { useState } from 'react';
import { Send, Shield, CheckCircle2, Lock, ArrowLeft, AlertCircle } from 'lucide-react';

interface ContactFormPageProps {
  onBack?: () => void;
}

export const ContactFormPage: React.FC<ContactFormPageProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Dúvidas sobre o Morph Browser AI',
    message: '',
    securityPin: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-full bg-slate-900 text-slate-100 p-4 pb-24 select-text">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-4">
        {onBack && (
          <button
            onClick={onBack}
            data-morph-id="BUTTON_BACK_CONTACT"
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div>
          <h1 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
            <Send className="w-4 h-4 text-indigo-400" />
            Central de Suporte & Formulário
          </h1>
          <p className="text-[11px] text-slate-400">Preencha os dados abaixo com segurança</p>
        </div>
      </div>

      {submitted ? (
        <div className="max-w-md mx-auto p-6 bg-slate-800/90 border border-emerald-500/40 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-emerald-300">Formulário Enviado com Sucesso!</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Seus dados foram transmitidos em ambiente seguro após autorização explícita do usuário. Protocolo: #{Math.floor(100000 + Math.random() * 900000)}.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            data-morph-id="BUTTON_NEW_FORM"
            className="mt-3 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-xs font-semibold text-white transition"
          >
            Preencher Novamente
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3.5">
          <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-200 flex items-start gap-2">
            <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>Proteção Ativa:</strong> O agente de IA pode auxiliar no preenchimento dos campos, mas é obrigado pelo sistema de segurança a pedir confirmação antes do envio final.
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="input_name">
              Nome Completo
            </label>
            <input
              id="input_name"
              name="name"
              type="text"
              data-morph-id="INPUT_NAME"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Digite seu nome..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="input_email">
              E-mail de Contato
            </label>
            <input
              id="input_email"
              name="email"
              type="email"
              data-morph-id="INPUT_EMAIL"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="exemplo@dominio.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="input_phone">
              Telefone / WhatsApp
            </label>
            <input
              id="input_phone"
              name="phone"
              type="tel"
              data-morph-id="INPUT_PHONE"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 98765-4321"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="select_topic">
              Assunto Principal
            </label>
            <select
              id="select_topic"
              data-morph-id="SELECT_TOPIC"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Dúvidas sobre o Morph Browser AI">Dúvidas sobre o Morph Browser AI</option>
              <option value="Reportar Problema Técnico">Reportar Problema Técnico</option>
              <option value="Sugestão de Nova Ferramenta">Sugestão de Nova Ferramenta</option>
              <option value="Parcerias e Integrações">Parcerias e Integrações</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="input_message">
              Mensagem ou Descrição da Solicitação
            </label>
            <textarea
              id="input_message"
              name="message"
              rows={3}
              data-morph-id="INPUT_MESSAGE"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Escreva detalhes da sua mensagem..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Sensitive Password field to test Requirement #8 */}
          <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300 mb-1">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>PIN de Autenticação Rápida (Opcional)</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Campo protegido. O modelo de IA nunca recebe ou digita senhas automaticamente.
            </p>
            <input
              id="input_pin"
              name="password"
              type="password"
              data-morph-id="INPUT_PASSWORD"
              value={formData.securityPin}
              onChange={(e) => setFormData({ ...formData, securityPin: e.target.value })}
              placeholder="••••"
              maxLength={6}
              className="w-full bg-slate-850 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              data-morph-id="BUTTON_SUBMIT_FORM"
              data-is-sensitive="true"
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl text-xs font-bold text-white shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Send className="w-3.5 h-3.5" />
              Enviar Formulário (Ação Sensível)
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
