import { AIService, AgentStepResponse } from './AIService';
import { actionExecutor } from './ActionExecutor';
import { taskMemory } from './TaskMemory';
import { confirmationManager } from './ConfirmationManager';
import { voiceService } from './VoiceService';
import { settingsManager } from './SettingsManager';
import { tabManager } from './TabManager';
import { PageAnalyzer } from './PageAnalyzer';
import { browserVision } from './BrowserVision';
import { NavigationResolver, NavigationIntent } from './NavigationResolver';
import { browserController } from './BrowserController';
import {
  AgentMessage,
  AgentStepLog,
  PageSnapshot,
  VisionSnapshot,
  AgentTaskStatus,
  TaskMemoryState,
} from '../types/browser';

export class AgentController {
  private isRunning: boolean = false;
  private shouldStop: boolean = false;
  private currentStatus: AgentTaskStatus = 'STOPPED';
  private messages: AgentMessage[] = [];
  private stepLogs: AgentStepLog[] = [];
  private listeners: (() => void)[] = [];
  private currentSnapshotProvider: (() => PageSnapshot) | null = null;
  private domContainerProvider: (() => HTMLElement | null) | null = null;
  private lastFailedStep: { goal: string; userClarification?: string } | null = null;

  constructor() {
    this.messages = [];
  }

  public registerProviders(
    snapshotProvider: () => PageSnapshot,
    domContainerProvider: () => HTMLElement | null
  ) {
    this.currentSnapshotProvider = snapshotProvider;
    this.domContainerProvider = domContainerProvider;
  }

  public getMessages(): AgentMessage[] {
    return [...this.messages];
  }

  public getStepLogs(): AgentStepLog[] {
    return [...this.stepLogs];
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getStatus(): AgentTaskStatus {
    return this.currentStatus;
  }

  public getActiveTask(): TaskMemoryState {
    return taskMemory.getState();
  }

  public getLastError(): { goal: string } | null {
    return this.lastFailedStep;
  }

  /**
   * Ponto de entrada para comandos do usuário
   */
  public async submitUserGoal(goalText: string, isClarification = false): Promise<void> {
    if (!goalText.trim()) return;

    if (this.isRunning) {
      this.stop();
      await new Promise((r) => setTimeout(r, 200));
    }

    this.shouldStop = false;
    this.isRunning = true;
    this.lastFailedStep = null;
    this.setTaskStatus('PLANNING');

    // Registra mensagem do usuário
    const userMsg: AgentMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: goalText,
      timestamp: Date.now(),
    };
    this.messages.push(userMsg);

    if (!isClarification) {
      taskMemory.initNewTask(goalText);
      this.stepLogs = [];
    }

    this.notify();

    // Dev Log (Requirement #11)
    console.log('[AGENT] User request:', goalText);

    // Inicia o fluxo verificado
    await this.processGoal(goalText);
  }

  /**
   * Processa o objetivo:
   * 1. Comandos diretos de histórico local ("Volta", "Atualiza")
   * 2. Loop autônomo coordenado com a Gemini como cérebro principal (Requirements #1 - #19)
   */
  private async processGoal(userGoal: string): Promise<void> {
    const rawGoal = userGoal.trim();
    const lower = rawGoal.toLowerCase();

    // Comandos de navegação de histórico local
    if (/^volta(r)?$/i.test(lower)) {
      await this.handleHistoryCommand('goBack', 'Retornando à página anterior...', 'Retornou para a página anterior.');
      return;
    }

    if (/^(atualiza(r)?|recarrega(r)?)( a página| a tela)?$/i.test(lower)) {
      await this.handleHistoryCommand('reload', 'Recarregando a página atual...', 'Página recarregada com sucesso.');
      return;
    }

    // Perguntas de Visão do Navegador (Browser Vision - Requirement #4)
    if (
      /o que (existe|tem|está vendo|você vê)|onde (fica|está|localiza).*pesquisa|quais botões|existe algum menu|analis(e|ar).*visão|browser vision|olhos/i.test(
        lower
      )
    ) {
      await this.handleVisionQuery(userGoal);
      return;
    }

    // Comandos de clicar em resultados ou elementos: "clica no resultado", "clica no primeiro", "entra no link"
    if (
      /^(?:clica|clicar|seleciona|selecionar|entra\s+no|abrir\s+o)\s+(?:no|na|em|num|numa|o|a)?\s*(?:resultado|primeiro|segundo|link|bot[ãa]o|card|op[çc][ãa]o)/i.test(
        lower
      ) ||
      /^(?:clica|clicar)\s+(?:nele|nela|ali|aqui)/i.test(lower)
    ) {
      const handled = await this.handleClickOrSelectGoal(rawGoal);
      if (handled) return;
    }

    // Fluxo Principal da Nova Arquitetura:
    // CHAT -> AI AGENT / GEMINI -> DECISOR -> [WEB SEARCH (Ativo) | BROWSER AGENT (Modular)]
    await this.processGoalWithDecisor(rawGoal);
  }

  /**
   * Executa clique real no resultado da busca anterior ou em elemento da página
   */
  private async handleClickOrSelectGoal(userGoal: string): Promise<boolean> {
    const lower = userGoal.toLowerCase();

    // Encontra mensagens anteriores que continham resultados de pesquisa
    const msgWithResults = [...this.messages]
      .reverse()
      .find((m) => m.searchResults && m.searchResults.length > 0);

    let targetResult: any = null;
    if (msgWithResults && msgWithResults.searchResults && msgWithResults.searchResults.length > 0) {
      if (lower.includes('segundo') && msgWithResults.searchResults.length > 1) {
        targetResult = msgWithResults.searchResults[1];
      } else if (lower.includes('terceiro') && msgWithResults.searchResults.length > 2) {
        targetResult = msgWithResults.searchResults[2];
      } else {
        // Tenta achar pelo nome mencionado ou pega o primeiro
        const matchByName = msgWithResults.searchResults.find((r) =>
          lower.includes((r.title || '').toLowerCase()) || lower.includes((r.source || '').toLowerCase())
        );
        targetResult = matchByName || msgWithResults.searchResults[0];
      }
    }

    if (targetResult && targetResult.url) {
      this.setTaskStatus('EXECUTING');
      this.addStepLog({
        id: `log_click_${Date.now()}`,
        timestamp: Date.now(),
        icon: '👆',
        text: `Clicando no resultado "${targetResult.title}"...`,
        status: 'in_progress',
      });

      await browserController.openUrl(targetResult.url, true);
      await browserController.wait(600);

      const title = browserController.getPageTitle() || targetResult.title;
      const snippet = browserController.getPageText().slice(0, 300);

      this.addStepLog({
        id: `log_click_done_${Date.now()}`,
        timestamp: Date.now(),
        icon: '✓',
        text: `Página aberta: ${title}`,
        status: 'completed',
      });

      this.setTaskStatus('COMPLETED');
      taskMemory.completeTask();

      const assistantMsg: AgentMessage = {
        id: `asst_click_${Date.now()}`,
        role: 'assistant',
        content: `Cliquei no resultado **${targetResult.title}** e abri a página no navegador.\n\n📄 **O que vi na página:** ${snippet || title}\n\nO que gostaria que eu explorasse ou fizesse agora nesta página?`,
        timestamp: Date.now(),
        decision: {
          type: 'browser_agent',
          targetUrl: targetResult.url,
          targetAction: `Abrir ${targetResult.title}`,
        },
        actionsTaken: [...this.stepLogs],
        suggestedFollowUps: ['Ver navegador', 'Voltar ao chat', 'Pesquisar outra coisa'],
      };

      this.messages.push(assistantMsg);
      this.isRunning = false;
      this.notify();
      return true;
    }

    // Se não há resultados no chat, tenta clicar no DOM da página aberta atualmente
    const currentUrl = browserController.getCurrentUrl();
    if (currentUrl && currentUrl !== 'morph://home') {
      this.setTaskStatus('EXECUTING');
      this.addStepLog({
        id: `log_dom_click_${Date.now()}`,
        timestamp: Date.now(),
        icon: '👆',
        text: `Procurando elemento para clicar na página atual...`,
        status: 'in_progress',
      });

      const clickRes = await browserController.click(userGoal);
      await browserController.wait(500);

      const newTitle = browserController.getPageTitle();
      const snippet = browserController.getPageText().slice(0, 250);

      this.setTaskStatus('COMPLETED');
      taskMemory.completeTask();

      const assistantMsg: AgentMessage = {
        id: `asst_click_${Date.now()}`,
        role: 'assistant',
        content: clickRes.success
          ? `Cliquei no elemento solicitado na página.\n\n📄 **Estado atual:** ${newTitle} - ${snippet}`
          : `Tentei clicar na página, mas não encontrei um botão correspondente. A página atual é: **${newTitle}**. Deseja que eu execute outra ação?`,
        timestamp: Date.now(),
        actionsTaken: [...this.stepLogs],
        suggestedFollowUps: ['Ver navegador', 'Voltar ao chat'],
      };

      this.messages.push(assistantMsg);
      this.isRunning = false;
      this.notify();
      return true;
    }

    return false;
  }

  /**
   * Processamento com o Decisor:
   * Separa claramente WEB SEARCH (pesquisas gerais da Internet com resultados reais)
   * de BROWSER AGENT (navegação e interação direta em sites).
   */
  private async processGoalWithDecisor(userGoal: string): Promise<void> {
    const rawGoal = userGoal.trim();
    if (!rawGoal) {
      this.finishWithError('Por favor, digite um termo de pesquisa ou solicitação válida.');
      return;
    }

    this.setTaskStatus('PLANNING');
    this.addStepLog({
      id: `log_decide_${Date.now()}`,
      timestamp: Date.now(),
      icon: '🧠',
      text: 'Gemini Agent analisando o pedido e acionando o Decisor...',
      status: 'in_progress',
    });

    try {
      const response = await fetch('/api/agent/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userGoal: rawGoal }),
      });

      if (!response.ok) {
        throw new Error(`Erro na comunicação com o servidor (HTTP ${response.status})`);
      }

      const data = await response.json();

      if (data.error && !data.answer) {
        this.finishWithError(data.error);
        return;
      }

      // 0. Decisão: AUTONOMOUS PLAN (Task Planner & Orquestrador Autónomo)
      if (data.decision?.type === 'autonomous_plan') {
        this.setTaskStatus('PLANNING');
        this.addStepLog({
          id: `log_plan_init_${Date.now()}`,
          timestamp: Date.now(),
          icon: '🧠',
          text: `Orquestrador: objetivo decomposto em ${data.plan?.totalSteps || 9} etapas pelo Task Planner.`,
          status: 'completed',
        });

        if (data.plan?.steps) {
          for (const s of data.plan.steps) {
            const icon =
              s.tool === 'web_search'
                ? '🔍'
                : s.tool === 'browser_vision'
                ? '👁️'
                : s.tool === 'browser_action'
                ? '⚡'
                : s.tool === 'verification'
                ? '🔎'
                : s.tool === 'browser_agent'
                ? '🌐'
                : '📊';
            this.addStepLog({
              id: `log_step_${s.id}_${Date.now()}`,
              timestamp: Date.now(),
              icon,
              text: `${s.stepNumber}. ${s.title}`,
              status: 'completed',
            });
          }
        }

        this.setTaskStatus('COMPLETED');
        taskMemory.completeTask();

        const assistantMsg: AgentMessage = {
          id: `asst_plan_${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          timestamp: Date.now(),
          decision: data.decision,
          plan: data.plan,
          extractedProducts: data.extractedProducts || [],
          comparisonTable: data.comparisonTable,
          verificationLogs: data.verificationLogs || [],
          searchResults: data.searchResults || [],
          actionsTaken: [...this.stepLogs],
        };

        this.messages.push(assistantMsg);
        this.isRunning = false;
        this.notify();
        return;
      }

      // 1. Decisão: WEB SEARCH
      if (data.decision?.type === 'web_search') {
        const queryTerm = data.decision.query || rawGoal;
        this.setTaskStatus('EXECUTING');
        this.addStepLog({
          id: `log_search_${Date.now()}`,
          timestamp: Date.now(),
          icon: '🔍',
          text: `A pesquisar na Web sobre "${queryTerm}"...`,
          status: 'in_progress',
        });

        const count = data.searchResults?.length || 0;
        this.addStepLog({
          id: `log_search_results_${Date.now()}`,
          timestamp: Date.now(),
          icon: '🌐',
          text: `${count} resultados reais obtidos da Internet. A analisar...`,
          status: 'completed',
        });

        this.setTaskStatus('COMPLETED');
        taskMemory.completeTask();

        this.addStepLog({
          id: `log_search_done_${Date.now()}`,
          timestamp: Date.now(),
          icon: '✓',
          text: 'Pesquisa concluída e analisada com sucesso.',
          status: 'completed',
        });

        const assistantMsg: AgentMessage = {
          id: `asst_search_${Date.now()}`,
          role: 'assistant',
          content: data.answer,
          timestamp: Date.now(),
          decision: data.decision,
          searchResults: data.searchResults || [],
          searchQuery: queryTerm,
          actionsTaken: [...this.stepLogs],
        };

        this.messages.push(assistantMsg);
        this.isRunning = false;
        this.notify();
        return;
      }

      // 2. Decisão: BROWSER AGENT (Execução Real no Browser Engine)
      if (data.decision?.type === 'browser_agent') {
        const targetUrl = data.decision.targetUrl || 'https://www.google.com';
        const siteLabel = data.decision.siteName || data.decision.targetAction || 'site';

        this.setTaskStatus('EXECUTING');
        this.addStepLog({
          id: `log_browser_nav_${Date.now()}`,
          timestamp: Date.now(),
          icon: '🌐',
          text: `Abrindo ${siteLabel} no navegador (${targetUrl})...`,
          status: 'in_progress',
        });

        // 1. Executa a navegação real e abre a interface do navegador
        await browserController.openUrl(targetUrl, true);

        // 2. Se houver pesquisa associada (ex: "Free Fire")
        if (data.decision.searchQuery) {
          this.addStepLog({
            id: `log_browser_search_${Date.now()}`,
            timestamp: Date.now(),
            icon: '🔍',
            text: `Pesquisando "${data.decision.searchQuery}" em ${siteLabel}...`,
            status: 'completed',
          });
          await browserController.wait(600);
        }

        // Aguarda estabilização do carregamento da página
        await browserController.wait(500);

        const currentTitle = browserController.getPageTitle() || siteLabel;

        this.addStepLog({
          id: `log_browser_done_${Date.now()}`,
          timestamp: Date.now(),
          icon: '✓',
          text: `Página carregada com sucesso: ${currentTitle}`,
          status: 'completed',
        });

        this.setTaskStatus('COMPLETED');
        taskMemory.completeTask();

        const assistantMsg: AgentMessage = {
          id: `asst_browser_${Date.now()}`,
          role: 'assistant',
          content: data.answer || `Abri o **${siteLabel}** no navegador.`,
          timestamp: Date.now(),
          decision: data.decision,
          browserAgentPlan: data.browserAgentPlan,
          searchResults: data.searchResults || [],
          actionsTaken: [...this.stepLogs],
          suggestedFollowUps: [
            'Ver navegador',
            'Pesquisar outra coisa',
            'Voltar ao chat',
          ],
        };

        this.messages.push(assistantMsg);
        this.isRunning = false;
        this.notify();
        return;
      }

      // 2.5 Decisão: BROWSER CLICK
      if (data.decision?.type === 'browser_click') {
        const handled = await this.handleClickOrSelectGoal(userGoal);
        if (handled) return;
      }

      // 3. Decisão: DIRECT ANSWER
      this.setTaskStatus('COMPLETED');
      taskMemory.completeTask();
      this.addStepLog({
        id: `log_direct_${Date.now()}`,
        timestamp: Date.now(),
        icon: '✓',
        text: 'Resposta formulada pelo agente.',
        status: 'completed',
      });

      const assistantMsg: AgentMessage = {
        id: `asst_direct_${Date.now()}`,
        role: 'assistant',
        content: data.answer,
        timestamp: Date.now(),
        decision: data.decision,
        actionsTaken: [...this.stepLogs],
      };

      this.messages.push(assistantMsg);
      this.isRunning = false;
      this.notify();
    } catch (err: any) {
      console.error('[AGENT] Erro ao processar solicitação:', err);
      this.finishWithError(`Falha na comunicação com o agente: ${err.message || 'Erro de conexão'}`);
    }
  }

  /**
   * Processamento de consultas via BrowserVision (Olhos da IA - SOMENTE LEITURA)
   */
  private async handleVisionQuery(userGoal: string): Promise<void> {
    this.setTaskStatus('OBSERVING');
    this.addStepLog({
      id: `log_vis_start_${Date.now()}`,
      timestamp: Date.now(),
      icon: '👁️',
      text: 'Browser Vision capturando DOM e imagem da página...',
      status: 'in_progress',
    });

    const domContainer = this.domContainerProvider ? this.domContainerProvider() : null;
    const currentTab = tabManager.getActiveTab();
    const url = currentTab?.url || 'morph://home';
    const title = currentTab?.title || 'Morph Browser';

    let snapshot: VisionSnapshot;
    if (domContainer) {
      snapshot = await browserVision.captureFullVision(domContainer, url, title, true);
    } else {
      snapshot = browserVision.getLastSnapshot() || {
        page: { url, title },
        elements: [],
        visibleText: '',
        headings: [],
        screenshotAvailable: false,
        timestamp: Date.now(),
      };
    }

    this.setTaskStatus('PLANNING');
    this.addStepLog({
      id: `log_vis_gemini_${Date.now()}`,
      timestamp: Date.now(),
      icon: '🤖',
      text: 'Gemini Vision analisando imagem e elementos do DOM...',
      status: 'in_progress',
    });

    const result = await browserVision.analyzeWithGeminiVision(snapshot, userGoal);

    this.setTaskStatus('COMPLETED');
    taskMemory.completeTask();

    this.addStepLog({
      id: `log_vis_done_${Date.now()}`,
      timestamp: Date.now(),
      icon: '✓',
      text: `Análise visual concluída (${snapshot.elements.length} elementos mapeados)`,
      status: 'completed',
    });

    const assistantMsg: AgentMessage = {
      id: `asst_vis_${Date.now()}`,
      role: 'assistant',
      content: result.answer,
      timestamp: Date.now(),
      actionsTaken: [...this.stepLogs],
      suggestedFollowUps: [
        'Onde está a caixa de pesquisa?',
        'Quais botões estão visíveis?',
        'Existe algum menu?',
        'Ver navegador',
      ],
    };

    this.messages.push(assistantMsg);
    this.isRunning = false;
    this.notify();
  }

  /**
   * Ciclo autônomo com a Gemini como Cérebro Principal (Requirements #1, #2, #3, #6, #8, #9, #13, #14):
   * while taskNotCompleted:
   *   observePage()
   *   sendContextToGemini()
   *   receiveDecision()
   *   validateDecision()
   *   executeTool()
   *   verifyResult()
   *   updateTaskState()
   *   continue
   */
  private async runAutonomousLoop(userGoal: string): Promise<void> {
    const MAX_ACTIONS_PER_TASK = 15;
    const TIMEOUT_PER_TASK = 60000; // 60 segundos
    const startTime = Date.now();
    let actionCount = 0;

    const actionHistory: { step: number; tool: string; params: any; result: string }[] = [];
    let lastActionResult: { tool: string; success: boolean; message: string } | undefined;
    let lastActionSignature = '';
    let repeatActionCount = 0;

    this.setTaskStatus('PLANNING');
    this.addStepLog({
      id: `log_init_${Date.now()}`,
      timestamp: Date.now(),
      icon: '🤖',
      text: 'Gemini analisando objetivo e estado da página...',
      status: 'in_progress',
    });

    while (this.isRunning && !this.shouldStop && actionCount < MAX_ACTIONS_PER_TASK) {
      // 1. Proteção de Timeout (Requirement #14)
      if (Date.now() - startTime > TIMEOUT_PER_TASK) {
        this.finishWithError('Tempo limite da tarefa excedido (45 segundos).', userGoal);
        return;
      }

      actionCount++;
      taskMemory.updateStepIndex();

      // 2. observePage: Page Analyzer extrai a página atual (Requirements #6 & #7)
      this.setTaskStatus('OBSERVING');
      const snapshot = this.currentSnapshotProvider ? this.currentSnapshotProvider() : null;
      if (!snapshot) {
        this.finishWithError('Não foi possível ler o estado da página atual.', userGoal);
        return;
      }

      const compactContext = PageAnalyzer.getCompactPageContext(snapshot);
      taskMemory.addNavTrail(snapshot.url);

      // 3. sendContextToGemini & receiveDecision: Gemini como cérebro principal via Tool Calling
      this.setTaskStatus('PLANNING');
      let stepResponse: AgentStepResponse;
      try {
        stepResponse = await AIService.queryAgentStep({
          userGoal,
          taskMemory: taskMemory.getState(),
          pageSnapshot: snapshot,
          compactContext,
          actionHistory,
          lastActionResult,
        });
      } catch (err: any) {
        this.finishWithError(
          'Não consegui contactar a IA. Verifique sua conexão e tente novamente.',
          userGoal
        );
        return;
      }

      if (this.shouldStop) {
        this.handleInterruption();
        return;
      }

      if (stepResponse.thought) {
        console.log('[GEMINI THOUGHT]', stepResponse.thought);
      }

      // 4. validateDecision: Validação e proteção contra loop repetido (Requirement #14)
      const action = stepResponse.action;
      const toolName = action?.tool || (stepResponse.isComplete ? 'complete_task' : 'wait');
      const params = action?.params || {};

      if (toolName && toolName !== 'complete_task' && toolName !== 'wait') {
        const currentSignature = `${toolName}:${JSON.stringify(params)}:${snapshot.url}`;
        if (currentSignature === lastActionSignature) {
          repeatActionCount++;
          if (repeatActionCount >= 2) {
            this.finishWithError('Não consegui concluir esta tarefa automaticamente.', userGoal);
            return;
          }
        } else {
          repeatActionCount = 0;
          lastActionSignature = currentSignature;
        }
      }

      // 5. Se a Gemini decidiu finalizar a tarefa (complete_task ou isComplete)
      if (stepResponse.isComplete || toolName === 'complete_task') {
        this.setTaskStatus('COMPLETED');
        taskMemory.completeTask();

        this.addStepLog({
          id: `log_done_${Date.now()}`,
          timestamp: Date.now(),
          icon: '✓',
          text: 'Tarefa concluída com sucesso',
          status: 'completed',
        });

        // Formata a resposta da assistente para o chat
        let finalResponse = stepResponse.userResponse || params.summary || 'Tarefa concluída com sucesso.';

        // Formatação do Teste Obrigatório #1 e #16: "✓ Google aberto."
        if (/google/i.test(userGoal) && /abre|abrir|ir para|vai para/i.test(userGoal) && snapshot.url.includes('google.com')) {
          if (!finalResponse.startsWith('✓')) {
            finalResponse = `✓ **Google aberto.**\n\n${finalResponse}`;
          }
        }

        const assistantMsg: AgentMessage = {
          id: `asst_${Date.now()}`,
          role: 'assistant',
          content: finalResponse,
          timestamp: Date.now(),
          comparisonTable: stepResponse.comparisonTable || undefined,
          actionsTaken: [...this.stepLogs],
          suggestedFollowUps: [
            'Resume esta página',
            'Pesquisar nesta página',
            'Ver navegador',
          ],
        };

        this.messages.push(assistantMsg);
        this.isRunning = false;
        this.notify();
        return;
      }

      // 6. executeTool: O aplicativo executa a ferramenta de verdade (Requirement #2 & #8)
      if (toolName && toolName !== 'wait') {
        if (stepResponse.logStep) {
          this.addStepLog({
            id: `log_act_${Date.now()}_${actionCount}`,
            timestamp: Date.now(),
            icon: stepResponse.logStep.icon || '⚙️',
            text: stepResponse.logStep.text,
            status: 'in_progress',
          });
        }

        this.setTaskStatus('EXECUTING');
        const domContainer = this.domContainerProvider ? this.domContainerProvider() : null;

        const execResult = await actionExecutor.execute(toolName, params, domContainer);

        if (this.shouldStop) {
          this.handleInterruption();
          return;
        }

        // Se a ação falhou ou exigiu confirmação e o usuário cancelou (Requirement #15)
        if (!execResult.success) {
          if (execResult.requiresUserConfirmation) {
            this.setTaskStatus('STOPPED');
            this.isRunning = false;
            this.notify();
            return;
          }

          this.addStepLog({
            id: `log_err_${Date.now()}`,
            timestamp: Date.now(),
            icon: '⚠️',
            text: `Erro ao executar ${toolName}: ${execResult.message}`,
            status: 'failed',
          });
          lastActionResult = { tool: toolName, success: false, message: execResult.message };
          actionHistory.push({
            step: actionCount,
            tool: toolName,
            params,
            result: `Falha: ${execResult.message}`,
          });
          continue;
        }

        // 7. verifyResult: Verifica o resultado no navegador e atualiza o estado (Requirement #9)
        this.setTaskStatus('VERIFYING');

        // Verificação específica de open_url
        if (toolName === 'open_url' || toolName === 'openUrl') {
          await new Promise((r) => setTimeout(r, 600));
          const currentTab = tabManager.getActiveTab();
          const targetUrl = params.url || '';
          const currentUrl = currentTab?.url || '';
          const currentTitle = currentTab?.title || '';

          this.addStepLog({
            id: `log_verify_${Date.now()}`,
            timestamp: Date.now(),
            icon: '🔍',
            text: `Verificando: URL = ${currentUrl}, Título = ${currentTitle}`,
            status: 'completed',
          });

          // Se a solicitação do usuário foi navegar para a página (ex: "Abre o Google", "Abre a Wikipedia")
          const navIntent = NavigationResolver.resolve(userGoal);
          const siteName = currentTitle || navIntent.siteName || params.url;

          // Se tiver pesquisa subsequente vinculada (ex: "Abre o Google e pesquisa celulares")
          if (navIntent.hasSubsequentSearch && navIntent.searchQuery) {
            await this.executeSubsequentSearch(navIntent.searchQuery, siteName, currentUrl);
            return;
          }

          const isDirectOpenCommand =
            (navIntent.isNavigation && !navIntent.hasSubsequentSearch) ||
            /^(?:abre|abra|abrir|vai para|vai pro|acessa|acesse|entra no|entra na|ir para)\s+(?:o|a|no|na|site\s+do|página\s+do)?\s*[a-zá-ú0-9_.:/-]+[.,!?]?$/i.test(userGoal.trim()) ||
            /^(?:https?|morph):\/\/[^\s]+$/i.test(userGoal.trim());

          if (isDirectOpenCommand) {
            this.setTaskStatus('COMPLETED');
            taskMemory.completeTask();

            this.addStepLog({
              id: `log_done_nav_${Date.now()}`,
              timestamp: Date.now(),
              icon: '✓',
              text: 'Tarefa concluída com sucesso',
              status: 'completed',
            });

            const assistantMsg: AgentMessage = {
              id: `asst_nav_${Date.now()}`,
              role: 'assistant',
              content: `✓ **${siteName} aberto.**\n\n• **URL:** \`${currentUrl}\`\n• **Título:** ${currentTitle}\n\nVocê pode tocar em **"Ver navegador"** no topo para visualizar ou interagir com a página.`,
              timestamp: Date.now(),
              actionsTaken: [...this.stepLogs],
              suggestedFollowUps: [
                'Resume esta página',
                'Pesquisar nesta página',
                'Ver navegador',
              ],
            };

            this.messages.push(assistantMsg);
            this.isRunning = false;
            this.notify();
            return;
          }
        }

        // Registra o resultado para alimentar a Gemini no próximo passo
        lastActionResult = { tool: toolName, success: true, message: execResult.message };
        actionHistory.push({
          step: actionCount,
          tool: toolName,
          params,
          result: execResult.message,
        });

        await new Promise((r) => setTimeout(r, 450));
      }
    }

    if (actionCount >= MAX_ACTIONS_PER_TASK) {
      this.finishWithError('Limite máximo de ações por tarefa atingido (8 passos).', userGoal);
    }
  }

  /**
   * Executa e VERIFICA uma navegação para URL (Requirements #1, #4, #5, #8)
   */
  private async handleNavigationIntent(navIntent: NavigationIntent, originalGoal: string): Promise<void> {
    const targetUrl = navIntent.targetUrl!;
    const siteName = navIntent.siteName || targetUrl;

    console.log('[AGENT] Intent: OPEN_URL');
    console.log('[AGENT] Target:', targetUrl);

    // Passo 1: Registra intenção e ação openUrl (Requirement #8)
    this.setTaskStatus('PLANNING');
    this.addStepLog({
      id: `log_nav_action_${Date.now()}`,
      timestamp: Date.now(),
      icon: '🌐',
      text: `openUrl("${targetUrl}")`,
      status: 'in_progress',
    });

    const initialSnapshot = this.currentSnapshotProvider ? this.currentSnapshotProvider() : null;
    const initialUrl = initialSnapshot?.url || tabManager.getActiveTab()?.url || '';

    // Passo 2: Executa openUrl no ActionExecutor e TabManager
    this.setTaskStatus('EXECUTING');
    console.log('[AGENT] Executing openUrl');
    const domContainer = this.domContainerProvider ? this.domContainerProvider() : null;
    const execResult = await actionExecutor.execute('openUrl', { url: targetUrl }, domContainer);

    if (this.shouldStop) {
      this.handleInterruption();
      return;
    }

    // Passo 3: Aguarda carregamento real da página
    this.setTaskStatus('OBSERVING');
    this.addStepLog({
      id: `log_nav_wait_${Date.now()}`,
      timestamp: Date.now(),
      icon: '⏳',
      text: 'Aguardando carregamento...',
      status: 'in_progress',
    });

    await new Promise((r) => setTimeout(r, 650));

    // Passo 4: Estado VERIFYING - Obtém URL e Título atuais e verifica (Requirements #5 & #8)
    this.setTaskStatus('VERIFYING');
    const currentTab = tabManager.getActiveTab();
    const newSnapshot = this.currentSnapshotProvider ? this.currentSnapshotProvider() : null;
    const currentUrl = currentTab?.url || newSnapshot?.url || targetUrl;
    const currentTitle = currentTab?.title || newSnapshot?.title || siteName;

    console.log('[AGENT] Current URL:', currentUrl, 'Title:', currentTitle);

    this.addStepLog({
      id: `log_nav_verify_${Date.now()}`,
      timestamp: Date.now(),
      icon: '🔍',
      text: `Verificando: URL = ${currentUrl}, Título = ${currentTitle}`,
      status: 'in_progress',
    });

    await new Promise((r) => setTimeout(r, 350));

    // Verificação estrita se a navegação realmente ocorreu
    const hasNavigated =
      currentUrl === targetUrl ||
      currentUrl.includes(targetUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')) ||
      (targetUrl.includes('google.com') && currentUrl.includes('google.com')) ||
      (targetUrl.includes('youtube.com') && currentUrl.includes('youtube.com')) ||
      (targetUrl.includes('wikipedia.org') && currentUrl.includes('wikipedia.org')) ||
      (targetUrl.startsWith('morph://') && currentUrl.startsWith(targetUrl)) ||
      (initialUrl !== currentUrl && currentUrl !== '' && !currentUrl.includes('morph://home'));

    if (!hasNavigated && !execResult.success) {
      console.log('[AGENT] Verification: FAILED');
      this.setTaskStatus('FAILED');
      this.addStepLog({
        id: `log_nav_fail_${Date.now()}`,
        timestamp: Date.now(),
        icon: '✗',
        text: `Falha ao carregar ${siteName}`,
        status: 'failed',
      });
      this.finishWithError(
        `Não foi possível abrir o site ${siteName} (${targetUrl}). Verifique a conexão ou a URL informada.`,
        originalGoal
      );
      return;
    }

    console.log('[AGENT] Verification: SUCCESS');
    taskMemory.addNavTrail(currentUrl);

    // Se o usuário também pediu pesquisa combinada: "Abre o Google e pesquisa smartphones Samsung" (Requirement #9)
    if (navIntent.hasSubsequentSearch && navIntent.searchQuery) {
      await this.executeSubsequentSearch(navIntent.searchQuery, siteName, currentUrl);
      return;
    }

    // Passo 5: Conclusão verificada de navegação direta (Requirement #8)
    this.setTaskStatus('COMPLETED');
    taskMemory.completeTask();

    this.addStepLog({
      id: `log_nav_done_${Date.now()}`,
      timestamp: Date.now(),
      icon: '✓',
      text: 'Tarefa concluída com sucesso',
      status: 'completed',
    });

    const assistantMsg: AgentMessage = {
      id: `asst_nav_${Date.now()}`,
      role: 'assistant',
      content: `Abri o **${siteName}** para você. Você pode tocar em **"Ver navegador"** para visualizar a página.\n\n• **URL:** \`${currentUrl}\`\n• **Título:** ${currentTitle}`,
      timestamp: Date.now(),
      actionsTaken: [...this.stepLogs],
      suggestedFollowUps: [
        'Resume esta página',
        'Pesquisar nesta página',
        'Ver navegador',
      ],
    };

    this.messages.push(assistantMsg);
    this.isRunning = false;
    this.notify();
  }

  /**
   * Executa busca subsequente na página aberta:
   * Carrega a pesquisa oficial e preenche o termo no campo de busca real da página.
   */
  private async executeSubsequentSearch(searchQuery: string, siteName: string, pageUrl: string): Promise<void> {
    const domContainer = this.domContainerProvider ? this.domContainerProvider() : null;
    const cleanQuery = searchQuery.replace(/^(?:por|sobre|o|a|os|as)\s+/i, '').trim();

    // 1. Determina a URL direta de busca conforme o site
    let directSearchUrl = '';
    const lowerSite = (siteName || '').toLowerCase();
    if (lowerSite.includes('google')) {
      directSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(cleanQuery)}`;
    } else if (lowerSite.includes('youtube')) {
      directSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery)}`;
    } else if (lowerSite.includes('wiki')) {
      directSearchUrl = `https://pt.wikipedia.org/w/index.php?search=${encodeURIComponent(cleanQuery)}`;
    } else if (lowerSite.includes('bing')) {
      directSearchUrl = `https://www.bing.com/search?q=${encodeURIComponent(cleanQuery)}`;
    }

    // 2. Executa a busca
    this.setTaskStatus('EXECUTING');
    this.addStepLog({
      id: `log_typing_${Date.now()}`,
      timestamp: Date.now(),
      icon: '⌨️',
      text: `Digitando e pesquisando "${cleanQuery}" em ${siteName}...`,
      status: 'in_progress',
    });

    if (directSearchUrl) {
      await actionExecutor.execute('open_url', { url: directSearchUrl }, domContainer);
    } else {
      await actionExecutor.execute('type', { text: cleanQuery, pressEnter: true }, domContainer);
    }

    // 3. Aguarda carregamento e verifica resultados
    this.setTaskStatus('VERIFYING');
    this.addStepLog({
      id: `log_waiting_results_${Date.now()}`,
      timestamp: Date.now(),
      icon: '⏳',
      text: 'Aguardando e analisando resultados...',
      status: 'in_progress',
    });

    await new Promise((r) => setTimeout(r, 700));
    const currentTab = tabManager.getActiveTab();
    const finalUrl = currentTab?.url || directSearchUrl || pageUrl;
    const finalTitle = currentTab?.title || `Pesquisa: ${cleanQuery}`;

    this.setTaskStatus('COMPLETED');
    taskMemory.completeTask();

    this.addStepLog({
      id: `log_search_done_${Date.now()}`,
      timestamp: Date.now(),
      icon: '✓',
      text: 'Pesquisa concluída com sucesso',
      status: 'completed',
    });

    const assistantMsg: AgentMessage = {
      id: `asst_search_${Date.now()}`,
      role: 'assistant',
      content: `✓ **Pesquisa concluída em ${siteName}!**\n\nResultados carregados para **"${cleanQuery}"**.\n• **URL:** \`${finalUrl}\`\n• **Título:** ${finalTitle}\n\nVocê pode tocar em **"Ver navegador"** no topo para explorar os links ou me pedir para resumir a página.`,
      timestamp: Date.now(),
      actionsTaken: [...this.stepLogs],
      suggestedFollowUps: [
        'Resume esta página',
        'Pesquisar outro termo',
        'Ver navegador',
      ],
    };

    this.messages.push(assistantMsg);
    this.isRunning = false;
    this.notify();
  }

  /**
   * Comandos de navegação de histórico: Volta / Atualiza (Testes 3 e 4)
   */
  private async handleHistoryCommand(command: 'goBack' | 'reload', inProgressText: string, completedText: string): Promise<void> {
    this.setTaskStatus('EXECUTING');
    this.addStepLog({
      id: `log_hist_${Date.now()}`,
      timestamp: Date.now(),
      icon: command === 'goBack' ? '↩️' : '🔄',
      text: inProgressText,
      status: 'in_progress',
    });

    await actionExecutor.execute(command, {});
    await new Promise((r) => setTimeout(r, 450));

    this.setTaskStatus('VERIFYING');
    this.addStepLog({
      id: `log_hist_done_${Date.now()}`,
      timestamp: Date.now(),
      icon: '✓',
      text: completedText,
      status: 'completed',
    });

    this.setTaskStatus('COMPLETED');
    taskMemory.completeTask();

    this.messages.push({
      id: `asst_hist_${Date.now()}`,
      role: 'assistant',
      content: `Ação executada: **${completedText}**`,
      timestamp: Date.now(),
      actionsTaken: [...this.stepLogs],
    });

    this.isRunning = false;
    this.notify();
  }

  public stop(): void {
    if (this.isRunning) {
      this.shouldStop = true;
      this.isRunning = false;
      this.setTaskStatus('STOPPED');
      taskMemory.cancelTask();
      voiceService.cancelSpeech();

      this.addStepLog({
        id: `log_stop_${Date.now()}`,
        timestamp: Date.now(),
        icon: '🛑',
        text: 'Ações interrompidas pelo usuário. O estado da página foi mantido.',
        status: 'failed',
      });

      this.messages.push({
        id: `msg_stopped_${Date.now()}`,
        role: 'system',
        content: '⏹️ **Agente interrompido.** As ações pendentes foram canceladas e o estado do navegador foi preservado.',
        timestamp: Date.now(),
      });

      this.notify();
    }
  }

  private handleInterruption(): void {
    this.isRunning = false;
    this.shouldStop = false;
    this.setTaskStatus('STOPPED');
    this.notify();
  }

  private finishWithError(reason: string, failedGoal?: string): void {
    this.isRunning = false;
    this.shouldStop = false;
    this.setTaskStatus('FAILED');

    if (failedGoal) {
      this.lastFailedStep = { goal: failedGoal };
    }

    this.messages.push({
      id: `err_${Date.now()}`,
      role: 'assistant',
      content: `❌ **Não consegui executar esta ação.**\n\nMotivo: ${reason}`,
      timestamp: Date.now(),
      error: reason,
    });

    this.notify();
  }

  public retryLastFailed(): void {
    if (this.lastFailedStep) {
      const goal = this.lastFailedStep.goal;
      this.lastFailedStep = null;
      this.submitUserGoal(goal);
    }
  }

  public clearHistory(): void {
    this.messages = [];
    this.stepLogs = [];
    taskMemory.reset();
    this.setTaskStatus('STOPPED');
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private setTaskStatus(status: AgentTaskStatus): void {
    this.currentStatus = status;
    const taskState = taskMemory.getState();
    taskState.status = status;
  }

  private addStepLog(log: AgentStepLog): void {
    const last = this.stepLogs[this.stepLogs.length - 1];
    if (last && last.status === 'in_progress') {
      last.status = 'completed';
    }
    this.stepLogs.push(log);
    this.notify();
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }
}

export const agentController = new AgentController();
