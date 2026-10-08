/**
 * =========================================================================
 * 🌐 BROWSER AGENT SERVICE (Módulo Separado da Web Search Tool)
 * =========================================================================
 * 
 * Arquitetura Modular preparada para a Fase 2:
 * Este módulo isola e prepara todas as capacidades do Browser Agent que serão
 * conectadas na próxima fase (navegador real, CDP / Playwright / Automação):
 * 
 * - abrir URLs reais
 * - observar páginas
 * - encontrar elementos
 * - clicar
 * - escrever
 * - pressionar Enter
 * - fazer scroll
 * - navegar (voltar, avançar, recarregar)
 * - ler conteúdo
 * 
 * Na Fase 1 atual:
 * O Decisor do Gemini identifica quando uma tarefa requer o Browser Agent e
 * formula o plano de execução, mantendo-o completamente separado da Web Search Tool.
 */

import { browserController } from './BrowserController';

export interface BrowserAgentCommand {
  type:
    | 'open_url'
    | 'observe_page'
    | 'find_element'
    | 'click'
    | 'type_text'
    | 'press_enter'
    | 'scroll'
    | 'go_back'
    | 'go_forward'
    | 'reload'
    | 'read_content';
  params?: Record<string, any>;
  targetUrl?: string;
  selector?: string;
  text?: string;
}

export interface BrowserAgentState {
  isConfigured: boolean;
  phase: 'live_browser_controller';
  currentUrl?: string;
  pageTitle?: string;
  activeStatus: 'idle' | 'navigating' | 'observing' | 'interacting';
  requiredDrivers: string[];
}

class BrowserAgentService {
  private state: BrowserAgentState = {
    isConfigured: true,
    phase: 'live_browser_controller',
    activeStatus: 'idle',
    requiredDrivers: ['Morph Internal Browser Engine', 'BrowserController'],
  };

  /**
   * Obtém o estado e documentação modular da ferramenta
   */
  public getState(): BrowserAgentState {
    return {
      ...this.state,
      currentUrl: browserController.getCurrentUrl(),
      pageTitle: browserController.getPageTitle(),
    };
  }

  /**
   * Abrir URL real no navegador interno Morph
   */
  public async openUrl(url: string): Promise<{ success: boolean; message: string; url: string }> {
    this.state.activeStatus = 'navigating';
    const result = await browserController.openUrl(url, true);
    this.state.activeStatus = 'idle';
    return {
      success: result.success,
      message: result.message,
      url: result.url,
    };
  }

  /**
   * Observar página e extrair árvore de elementos do DOM
   */
  public async observePage(): Promise<{ success: boolean; elements: any[]; title: string; url: string }> {
    this.state.activeStatus = 'observing';
    const elements = browserController.getElements();
    const title = browserController.getPageTitle();
    const url = browserController.getCurrentUrl();
    this.state.activeStatus = 'idle';
    return {
      success: true,
      elements,
      title,
      url,
    };
  }

  /**
   * Clicar em elemento real no navegador
   */
  public async click(selectorOrId: string): Promise<{ success: boolean; message: string }> {
    this.state.activeStatus = 'interacting';
    const result = await browserController.click(selectorOrId);
    this.state.activeStatus = 'idle';
    return result;
  }

  /**
   * Digitar texto no elemento
   */
  public async typeText(selectorOrId: string, text: string): Promise<{ success: boolean; message: string }> {
    this.state.activeStatus = 'interacting';
    const result = await browserController.type(selectorOrId, text, true);
    this.state.activeStatus = 'idle';
    return result;
  }

  /**
   * Rolar página real
   */
  public async scroll(direction: 'up' | 'down', amount = 350): Promise<{ success: boolean }> {
    this.state.activeStatus = 'interacting';
    const result = await browserController.scroll(direction, amount);
    this.state.activeStatus = 'idle';
    return { success: result.success };
  }

  /**
   * Pressionar tecla no elemento ativo
   */
  public async pressEnter(): Promise<{ success: boolean }> {
    this.state.activeStatus = 'interacting';
    const result = await browserController.pressKey('Enter');
    this.state.activeStatus = 'idle';
    return { success: result.success };
  }
}

export const browserAgentService = new BrowserAgentService();
