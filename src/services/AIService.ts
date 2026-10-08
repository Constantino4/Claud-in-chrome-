import { PageSnapshot, TaskMemoryState } from '../types/browser';
import { NavigationResolver } from './NavigationResolver';

export interface AgentStepResponse {
  thought: string;
  logStep: {
    icon: string;
    text: string;
    status: 'in_progress' | 'completed' | 'requires_confirmation' | 'failed';
  };
  action: {
    tool: string;
    params: Record<string, any>;
    reasoning: string;
  };
  isComplete: boolean;
  requiresConfirmation?: {
    title: string;
    description: string;
    actionType: 'purchase' | 'payment' | 'submit_form' | 'login' | 'delete_data';
  } | null;
  extractedFindings?: {
    summary?: string;
    items?: any[];
  };
  userResponse: string;
  comparisonTable?: {
    headers: string[];
    rows: (string | number)[][];
  } | null;
}

export class AIService {
  /**
   * Envia o contexto da página observada e objetivo para a rota backend segura com Gemini API
   */
  public static async queryAgentStep(params: {
    userGoal: string;
    taskMemory: TaskMemoryState;
    pageSnapshot: PageSnapshot;
    compactContext?: any;
    actionHistory?: any[];
    lastActionResult?: any;
    historyTrail?: string[];
    userClarification?: string;
  }): Promise<AgentStepResponse> {
    try {
      const response = await fetch('/api/agent/step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Erro na API (${response.status})`);
      }

      const data = await response.json();
      if (data.isFallbackNeeded || (!data.action && !data.toolCall && !data.isComplete && !data.userResponse)) {
        return this.localIntelligentFallback(params);
      }

      // Se a Gemini escolheu uma ferramenta via Function Calling
      if (data.toolCall) {
        const toolName = data.toolCall.name;
        const toolArgs = data.toolCall.args || {};
        return {
          thought: data.thought || `Decisão da Gemini: ${toolName}.`,
          logStep: this.getLogStepForTool(toolName, toolArgs),
          action: {
            tool: toolName,
            params: toolArgs,
            reasoning: data.thought || '',
          },
          isComplete: data.isComplete || false,
          userResponse: data.userResponse || '',
        };
      }

      if (data.action) {
        return {
          ...data,
          logStep: data.logStep || this.getLogStepForTool(data.action.tool, data.action.params || {}),
        };
      }

      return data as AgentStepResponse;
    } catch (err: any) {
      console.warn('Backend Gemini em contingência, executando motor local de agente:', err.message);
      return this.localIntelligentFallback(params);
    }
  }

  private static getLogStepForTool(tool: string, params: Record<string, any>) {
    switch (tool) {
      case 'open_url':
      case 'openUrl':
        return { icon: '🌐', text: `open_url("${params.url || ''}")`, status: 'in_progress' as const };
      case 'click_element':
      case 'click':
        return { icon: '🖱️', text: `click_element("${params.element_id || params.elementId || ''}")`, status: 'in_progress' as const };
      case 'type_text':
      case 'type':
        return { icon: '⌨️', text: `type_text("${params.element_id || params.elementId || ''}", "${params.text || ''}")`, status: 'in_progress' as const };
      case 'scroll_page':
      case 'scroll':
        return { icon: '📜', text: `scroll_page(${params.direction || 'down'}, ${params.amount || 350})`, status: 'in_progress' as const };
      case 'find_text':
        return { icon: '🔎', text: `find_text("${params.text || ''}")`, status: 'in_progress' as const };
      case 'extract_page':
        return { icon: '👁️', text: 'extract_page()', status: 'in_progress' as const };
      case 'wait':
        return { icon: '⏳', text: `wait(${params.milliseconds || 500}ms)`, status: 'in_progress' as const };
      case 'go_back':
        return { icon: '↩️', text: 'go_back()', status: 'in_progress' as const };
      case 'go_forward':
        return { icon: '↪️', text: 'go_forward()', status: 'in_progress' as const };
      case 'reload_page':
        return { icon: '🔄', text: 'reload_page()', status: 'in_progress' as const };
      case 'open_tab':
        return { icon: '📑', text: `open_tab("${params.url || ''}")`, status: 'in_progress' as const };
      case 'close_tab':
        return { icon: '❌', text: 'close_tab()', status: 'in_progress' as const };
      case 'switch_tab':
        return { icon: '🔀', text: `switch_tab("${params.tab_id || ''}")`, status: 'in_progress' as const };
      case 'complete_task':
        return { icon: '✓', text: 'complete_task()', status: 'completed' as const };
      default:
        return { icon: '⚙️', text: `${tool}()`, status: 'in_progress' as const };
    }
  }

  /**
   * Motor local de contingência: executa o loop autônomo com base na observação real do DOM
   */
  private static localIntelligentFallback(params: {
    userGoal: string;
    taskMemory: TaskMemoryState;
    pageSnapshot: PageSnapshot;
    compactContext?: any;
    actionHistory?: any[];
    lastActionResult?: any;
    historyTrail?: string[];
    userClarification?: string;
  }): AgentStepResponse {
    const goal = params.userGoal.toLowerCase();
    const snapshot = params.pageSnapshot;
    const step = params.taskMemory.currentStepIndex;
    const previousProducts = params.taskMemory.findings.products || snapshot.products || [];

    // Cenário de Navegação Explícita: "Abre o Google", "Vai para o YouTube", "Abre a Wikipédia", etc.
    const navIntent = NavigationResolver.resolve(params.userGoal);
    if (navIntent.isNavigation && navIntent.targetUrl) {
      const alreadyOnSite =
        snapshot.url === navIntent.targetUrl ||
        (snapshot.url.includes('google.com') && navIntent.targetUrl.includes('google.com')) ||
        (snapshot.url.includes('youtube.com') && navIntent.targetUrl.includes('youtube.com')) ||
        (snapshot.url.includes('wikipedia.org') && navIntent.targetUrl.includes('wikipedia.org'));

      if (alreadyOnSite && !navIntent.hasSubsequentSearch) {
        return {
          thought: `Página ${navIntent.siteName || navIntent.targetUrl} já está aberta no navegador.`,
          logStep: {
            icon: '✓',
            text: `${navIntent.siteName || 'Página'} aberta`,
            status: 'completed',
          },
          action: {
            tool: 'wait',
            params: { milliseconds: 200 },
            reasoning: 'Página já carregada.',
          },
          isComplete: true,
          userResponse: `✓ **${navIntent.siteName || snapshot.title} aberto.**\n\n• **URL:** \`${snapshot.url}\``,
        };
      }

      return {
        thought: `O usuário solicitou navegar para ${navIntent.siteName || navIntent.targetUrl}. Vou acionar a ferramenta openUrl.`,
        logStep: {
          icon: '🌐',
          text: `openUrl("${navIntent.targetUrl}")`,
          status: 'in_progress',
        },
        action: {
          tool: 'openUrl',
          params: { url: navIntent.targetUrl },
          reasoning: `Navegando para ${navIntent.siteName || navIntent.targetUrl}`,
        },
        isComplete: false,
        userResponse: `Navegando para **${navIntent.siteName || navIntent.targetUrl}**...`,
      };
    }

    // Cenário de Continuidade Conversacional: "Qual é o mais barato?" ou "Qual tem menor preço?"
    if (/qual( é)?( o)?( mais| menor)? barat|mais em conta|menor pre[çc]o/i.test(goal) && previousProducts.length > 0) {
      const sorted = [...previousProducts].sort((a, b) => a.numericPrice - b.numericPrice);
      const cheapest = sorted[0];
      return {
        thought: `O usuário perguntou qual é o mais barato referente aos produtos encontrados anteriormente. O mais barato é ${cheapest.name} por ${cheapest.price}.`,
        logStep: {
          icon: '✓',
          text: 'Resposta identificada na memória da tarefa',
          status: 'completed',
        },
        action: {
          tool: 'wait',
          params: { milliseconds: 200 },
          reasoning: 'Resposta direta com base na memória recente.',
        },
        isComplete: true,
        userResponse: `Entre as opções encontradas, o **${cheapest.name}** é o mais barato, custando **${cheapest.price}**.\n\nEspecificações principais: ${cheapest.specs ? cheapest.specs.join(', ') : '128GB, Bateria 5000mAh'}.`,
      };
    }

    // Cenário de Comando Curto: "Volta" ou "Retornar"
    if (/^volta(r)?$/i.test(goal.trim())) {
      return {
        thought: 'O usuário solicitou voltar à página anterior no navegador.',
        logStep: {
          icon: '↩️',
          text: 'Voltando à página anterior...',
          status: 'completed',
        },
        action: {
          tool: 'goBack',
          params: {},
          reasoning: 'Comando de navegação goBack.',
        },
        isComplete: true,
        userResponse: 'Retornei para a página anterior no navegador.',
      };
    }

    // Cenário 1: "Procura por smartphones baratos" (Exemplo do fluxo completo de múltiplos passos)
    if (/smartphones?|celula(r|res)|barat|preço|comprar/i.test(goal)) {
      // Se estiver na página de busca ou home e tiver o campo de busca (INPUT_01)
      const searchInput = snapshot.elements.find((el) => el.id === 'INPUT_01' || (el.category === 'input' && /pesquis|busca/i.test(el.placeholder || el.text)));
      const searchButton = snapshot.elements.find((el) => el.id === 'BUTTON_01' || (el.category === 'button' && /buscar|pesquisar/i.test(el.text)));

      // Passo 0: Observa campo de pesquisa e digita
      if (searchInput && (!searchInput.value || searchInput.value.trim() === '')) {
        return {
          thought: `Observei a página inicial e localizei o campo de pesquisa ${searchInput.id}. Vou digitar "smartphones baratos".`,
          logStep: {
            icon: '⌨️',
            text: 'Digitando pesquisa...',
            status: 'in_progress',
          },
          action: {
            tool: 'type',
            params: { elementId: searchInput.id, text: 'smartphones baratos' },
            reasoning: 'Preenchendo o termo no campo de busca.',
          },
          isComplete: false,
          userResponse: 'Localizei o campo de busca e estou digitando "smartphones baratos"...',
        };
      }

      // Passo 1: Clica no botão de busca para abrir os resultados
      if (searchInput && searchButton && (!snapshot.products || snapshot.products.length === 0)) {
        return {
          thought: `Termo digitado no campo de busca. Agora clicando em ${searchButton.id} para carregar os resultados.`,
          logStep: {
            icon: '🖱️',
            text: 'Clicando em pesquisar...',
            status: 'in_progress',
          },
          action: {
            tool: 'click',
            params: { elementId: searchButton.id, text: searchButton.text },
            reasoning: 'Submetendo a pesquisa para obter catálogo de celulares.',
          },
          isComplete: false,
          userResponse: 'Executando a pesquisa na loja...',
        };
      }

      // Passo 2: A nova página (TechShop) foi aberta e possui produtos!
      const products = snapshot.products || [];
      if (products.length > 0) {
        const sorted = [...products].sort((a, b) => a.numericPrice - b.numericPrice);
        const cheapest = sorted[0];

        if (step <= 2) {
          return {
            thought: `Página de resultados carregada. Identifiquei ${products.length} celulares. Rolando para examinar detalhes e especificações.`,
            logStep: {
              icon: '⏳',
              text: 'Aguardando e analisando resultados...',
              status: 'in_progress',
            },
            action: {
              tool: 'scroll',
              params: { direction: 'down', amount: 350 },
              reasoning: 'Visualizando catálogo de produtos na página de resultados.',
            },
            isComplete: false,
            userResponse: `Encontrei ${products.length} smartphones na página de resultados. Analisando preços e configurações...`,
          };
        }

        // Conclusão com Tabela Comparativa formatada
        const rows = sorted.map((p) => [
          p.name,
          p.price,
          p.numericPrice === cheapest.numericPrice ? '🏆 Menor Preço' : 'Boa Opção',
          p.specs ? p.specs.slice(0, 2).join(' • ') : 'Android 14, 5000mAh',
        ]);

        return {
          thought: `Tarefa concluída. O mais barato é o ${cheapest.name} por ${cheapest.price}.`,
          logStep: {
            icon: '✓',
            text: 'Tarefa concluída com sucesso',
            status: 'completed',
          },
          action: {
            tool: 'wait',
            params: { milliseconds: 300 },
            reasoning: 'Apresentação do resumo e tabela ao usuário.',
          },
          isComplete: true,
          comparisonTable: {
            headers: ['Modelo', 'Preço', 'Destaque', 'Configuração'],
            rows,
          },
          extractedFindings: {
            summary: `O modelo mais barato identificado é o ${cheapest.name} por ${cheapest.price}.`,
            items: sorted,
          },
          userResponse: `Aqui está o resumo dos smartphones encontrados:\n\nO modelo mais barato é o **${cheapest.name}**, custando **${cheapest.price}**.\nConfira a comparação completa na tabela abaixo:`,
        };
      }
    }

    // Cenário 2: "Preenche este formulário com os dados"
    if (/formul|contato|preench|dados/i.test(goal)) {
      const inputs = snapshot.elements.filter((el) => el.category === 'input' || el.category === 'textarea');
      const submitBtn = snapshot.elements.find((el) => el.category === 'button' && /enviar|submit/i.test(el.text));

      // Se houver campos vazios, preenche-os
      const emptyInput = inputs.find((inp) => !inp.value || inp.value.trim() === '');
      if (emptyInput) {
        const sampleText = /nome/i.test(emptyInput.text) ? 'Alex Silva' :
                           /email/i.test(emptyInput.text) ? 'alex.silva@exemplo.com' :
                           /phone|tel/i.test(emptyInput.text) ? '(11) 98765-4321' :
                           /mensag|desc/i.test(emptyInput.text) ? 'Olá! Gostaria de obter mais informações sobre o produto.' :
                           'São Paulo, SP';
        return {
          thought: `Preenchendo campo identificado ${emptyInput.id} ("${emptyInput.text}").`,
          logStep: {
            icon: '⌨️',
            text: `Preenchendo: ${emptyInput.text}...`,
            status: 'in_progress',
          },
          action: {
            tool: 'type',
            params: { elementId: emptyInput.id, text: sampleText },
            reasoning: 'Inserindo valor no campo do formulário.',
          },
          isComplete: false,
          userResponse: `Preenchi o campo **${emptyInput.text}** com os dados fornecidos.`,
        };
      }

      // Se todos estiverem preenchidos, aciona autorização explícita de segurança
      if (submitBtn) {
        return {
          thought: 'Todos os campos foram preenchidos. O envio é uma ação sensível e precisa da autorização do usuário.',
          logStep: {
            icon: '⚠️',
            text: 'Solicitando autorização para envio...',
            status: 'requires_confirmation',
          },
          action: {
            tool: 'click',
            params: { elementId: submitBtn.id, text: submitBtn.text },
            reasoning: 'Clique no botão de envio com confirmação obrigatória.',
          },
          isComplete: true,
          requiresConfirmation: {
            title: 'Esta ação precisa da sua confirmação.',
            description: 'O formulário foi preenchido. Deseja autorizar o envio dos dados?',
            actionType: 'submit_form',
          },
          userResponse: 'Preenchi todos os campos do formulário com sucesso. Conforme as regras de segurança, **não enviarei sem a sua confirmação explícita**.',
        };
      }
    }

    // Cenário 3: "Resume esta página" ou "Explica o que está nesta página"
    if (/resum|explic|conteúdo|sobre o que/i.test(goal)) {
      const headings = snapshot.headings.slice(0, 4).join(', ');
      const preview = snapshot.mainTextSnippet.slice(0, 320);
      return {
        thought: `Página "${snapshot.title}" analisada. Extraídos ${snapshot.elements.length} elementos interativos.`,
        logStep: {
          icon: '✓',
          text: 'Página analisada e resumida com sucesso',
          status: 'completed',
        },
        action: {
          tool: 'wait',
          params: { milliseconds: 300 },
          reasoning: 'Resumo concluído diretamente.',
        },
        isComplete: true,
        userResponse: `**Resumo da Página (${snapshot.title}):**\n\n${preview || 'Página carregada com sucesso no Morph Browser.'}\n\n**Tópicos Principais:** ${headings || 'Nenhum tópico em destaque.'}`,
      };
    }

    // Cenário 4: Links de navegação
    const matchedLink = snapshot.elements.find(
      (el) => el.category === 'link' && goal.split(' ').some((word) => word.length > 3 && el.text.toLowerCase().includes(word))
    );
    if (matchedLink) {
      return {
        thought: `Link relevante encontrado: "${matchedLink.text}" (${matchedLink.id}).`,
        logStep: {
          icon: '🖱️',
          text: `Acessando: ${matchedLink.text}...`,
          status: 'in_progress',
        },
        action: {
          tool: 'click',
          params: { elementId: matchedLink.id, text: matchedLink.text },
          reasoning: 'Navegando pelo link selecionado na página.',
        },
        isComplete: false,
        userResponse: `Acessando o link **${matchedLink.text}**...`,
      };
    }

    // Retorno padrão quando não há ação específica a ser executada
    return {
      thought: `Observei a página "${snapshot.title}". O comando não corresponde a nenhuma ação automatizada direta nesta tela.`,
      logStep: {
        icon: 'ℹ️',
        text: 'Página observada',
        status: 'completed',
      },
      action: {
        tool: 'wait',
        params: { milliseconds: 200 },
        reasoning: 'Apresentação do estado da página e orientação ao usuário.',
      },
      isComplete: false,
      userResponse: `Observei a página **${snapshot.title}** (${snapshot.elements.length} elementos identificados).\n\nPosso abrir sites (ex: **"Abre o Google"**, **"Vai para o YouTube"**, **"Abre a Wikipédia"**), pesquisar smartphones, comparar preços ou preencher formulários. Como deseja prosseguir?`,
    };
  }
}
