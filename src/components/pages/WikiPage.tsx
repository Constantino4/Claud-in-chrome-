import React from 'react';
import { BookOpen, Share2, ArrowLeft, ExternalLink, Bookmark } from 'lucide-react';

interface WikiPageProps {
  onBack?: () => void;
  onNavigate?: (url: string) => void;
}

export const WikiPage: React.FC<WikiPageProps> = ({ onBack, onNavigate }) => {
  return (
    <div className="min-h-full bg-slate-900 text-slate-100 p-4 pb-24 select-text">
      {/* Article Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              data-morph-id="BUTTON_BACK_WIKI"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            WikiMorph Enciclopédia
          </span>
        </div>
      </div>

      <article className="max-w-xl mx-auto space-y-4 text-xs leading-relaxed text-slate-300">
        <h1 className="text-xl font-extrabold text-slate-100 tracking-tight">
          Navegadores com Agente de Inteligência Artificial
        </h1>

        <p className="text-slate-400 italic">
          Publicado em outubro de 2025 • Tempo estimado de leitura: 3 minutos
        </p>

        <p>
          Os <strong>navegadores com agente de IA integrado</strong> representam uma mudança fundamental na interação homem-computador. Diferente dos navegadores convencionais que apenas renderizam documentos HTML estáticos, um navegador agentic como o <strong>Morph Browser AI</strong> é capaz de compreender a semântica da página, identificar elementos acionáveis e executar tarefas multi-passo em nome do usuário.
        </p>

        <h2 className="text-base font-bold text-slate-100 pt-2 border-t border-slate-800">
          Como Funciona o Fluxo de Ação Autônoma
        </h2>

        <p>
          O ciclo de vida de uma tarefa executada por um agente navegador segue uma sequência contínua de quatro estágios:
        </p>

        <ol className="list-decimal pl-5 space-y-1.5 text-slate-300">
          <li><strong>Observação da Página:</strong> O analisador DOM examina o documento, gerando identificadores únicos (como BUTTON_01, INPUT_02, LINK_05) sem depender de coordenadas numéricas fictícias.</li>
          <li><strong>Raciocínio & Decisão:</strong> O modelo de inteligência artificial recebe o objetivo do usuário e a árvore estruturada da página para decidir a próxima ferramenta ideal.</li>
          <li><strong>Ponte JavaScript Segura:</strong> As ações de clique, digitação, seleção e rolagem são despachadas através de uma camada isolada (sandbox) com controle estrito de permissões.</li>
          <li><strong>Confirmação de Segurança:</strong> Ações com impacto financeiro, envio de formulários ou transações sensíveis exigem consentimento explícito do usuário através de um modal de confirmação.</li>
        </ol>

        <h2 className="text-base font-bold text-slate-100 pt-2 border-t border-slate-800">
          Comparação: Navegadores Tradicionais vs. Morph Browser AI
        </h2>

        <div className="overflow-x-auto my-3">
          <table className="w-full text-left border-collapse border border-slate-700/80 rounded-lg">
            <thead>
              <tr className="bg-slate-800 text-slate-200">
                <th className="p-2 border border-slate-700 font-semibold">Recurso</th>
                <th className="p-2 border border-slate-700 font-semibold">Navegador Tradicional</th>
                <th className="p-2 border border-slate-700 font-semibold text-cyan-400">Morph Browser AI</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border border-slate-700 font-medium">Execução de Tarefas</td>
                <td className="p-2 border border-slate-700 text-slate-400">Manual pelo usuário</td>
                <td className="p-2 border border-slate-700 text-emerald-300">Autônoma pelo Agente</td>
              </tr>
              <tr className="bg-slate-850/50">
                <td className="p-2 border border-slate-700 font-medium">Comparação de Preços</td>
                <td className="p-2 border border-slate-700 text-slate-400">Abertura manual de várias abas</td>
                <td className="p-2 border border-slate-700 text-emerald-300">Extração e tabela automática</td>
              </tr>
              <tr>
                <td className="p-2 border border-slate-700 font-medium">Proteção Anti-Injection</td>
                <td className="p-2 border border-slate-700 text-slate-400">Não aplicável</td>
                <td className="p-2 border border-slate-700 text-emerald-300">Conteúdo isolado em tags seguras</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-base font-bold text-slate-100 pt-2 border-t border-slate-800">
          Navegação & Links Relacionados
        </h2>

        <div className="space-y-2 pt-1">
          <button
            onClick={() => onNavigate && onNavigate('morph://techshop')}
            data-morph-id="LINK_STORE_WIKI"
            className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 flex items-center justify-between text-xs text-cyan-300 font-medium transition"
          >
            <span>Ver aplicação prática no catálogo TechShop</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onNavigate && onNavigate('morph://contact')}
            data-morph-id="LINK_CONTACT_WIKI"
            className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-indigo-500/50 flex items-center justify-between text-xs text-indigo-300 font-medium transition"
          >
            <span>Falar com o suporte técnico e desenvolvedores</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </article>
    </div>
  );
};
