import { confirmationManager } from './ConfirmationManager';
import { SecurityManager } from './SecurityManager';
import { tabManager } from './TabManager';
import { PageSnapshot } from '../types/browser';
import { browserController } from './BrowserController';

export interface ExecutionResult {
  success: boolean;
  message: string;
  data?: any;
  requiresUserConfirmation?: boolean;
  newSnapshot?: PageSnapshot;
}

export class ActionExecutor {
  private activeHighlightElement: HTMLElement | null = null;
  private browserEngineHandler: any = null;

  public setBrowserEngineHandler(handler: any) {
    this.browserEngineHandler = handler;
    browserController.setBrowserEngineHandler(handler);
  }

  /**
   * Executa a ferramenta solicitada pelo Agente com checagem de sensibilidade,
   * feedback visual no DOM e observação do novo estado da página.
   */
  public async execute(
    toolName: string,
    params: Record<string, any>,
    pageContainer?: HTMLElement | null
  ): Promise<ExecutionResult> {
    const tool = this.normalizeToolName(toolName);

    try {
      let result: { success: boolean; message: string; data?: any; requiresUserConfirmation?: boolean };

      switch (tool) {
        case 'click':
          result = await this.executeClick(params, pageContainer);
          break;

        case 'type':
          result = await this.executeType(params, pageContainer);
          break;

        case 'scroll':
          result = await this.executeScroll(params, pageContainer);
          break;

        case 'openUrl':
          result = await this.executeOpenUrl(params);
          break;

        case 'goBack':
          result = await this.executeGoBack();
          break;

        case 'goForward':
          result = await this.executeGoForward();
          break;

        case 'reload':
          result = await this.executeReload();
          break;

        case 'pressKey':
          result = await browserController.pressKey(params.key || 'Enter', params.elementId || params.element_id);
          break;

        case 'getCurrentUrl':
          result = { success: true, message: browserController.getCurrentUrl() };
          break;

        case 'getPageTitle':
          result = { success: true, message: browserController.getPageTitle() };
          break;

        case 'getPageText':
          result = { success: true, message: browserController.getPageText() };
          break;

        case 'getElements':
          result = { success: true, message: 'Elementos obtidos.', data: browserController.getElements() };
          break;

        case 'takeScreenshot': {
          const shot = await browserController.takeScreenshot();
          result = { success: shot.success, message: 'Captura realizada.', data: shot.screenshot };
          break;
        }

        case 'findText':
          result = await this.executeFindText(params, pageContainer);
          break;

        case 'wait':
          result = await this.executeWait(params);
          break;

        case 'extractPage':
          result = await this.executeExtractPage();
          break;

        case 'openTab':
          result = await this.executeOpenTab(params);
          break;

        case 'closeTab':
          result = await this.executeCloseTab(params);
          break;

        case 'switchTab':
          result = await this.executeSwitchTab(params);
          break;

        case 'select':
          result = await this.executeSelect(params, pageContainer);
          break;

        default:
          result = { success: false, message: `Ferramenta desconhecida: ${toolName}` };
      }

      // Se a ação solicitou ou foi cancelada por confirmação
      if (result.requiresUserConfirmation || !result.success) {
        return result;
      }

      // Espera a página atualizar após a ação
      await this.wait(350);

      // Analisa novamente a página e obtém o novo snapshot atualizado
      let newSnapshot: PageSnapshot | undefined;
      if (this.browserEngineHandler?.getSnapshot) {
        newSnapshot = this.browserEngineHandler.getSnapshot();
      }

      return {
        ...result,
        newSnapshot,
      };
    } catch (err: any) {
      return { success: false, message: `Erro ao executar ${toolName}: ${err.message}` };
    }
  }

  /**
   * Normaliza os nomes de ferramentas (suporta snake_case e camelCase)
   */
  private normalizeToolName(tool: string): string {
    const map: Record<string, string> = {
      browser_click: 'click',
      click: 'click',
      click_element: 'click',
      browser_type: 'type',
      type: 'type',
      type_text: 'type',
      browser_scroll: 'scroll',
      scroll: 'scroll',
      scroll_page: 'scroll',
      browser_open_url: 'openUrl',
      openUrl: 'openUrl',
      open_url: 'openUrl',
      browser_go_back: 'goBack',
      goBack: 'goBack',
      go_back: 'goBack',
      browser_go_forward: 'goForward',
      goForward: 'goForward',
      go_forward: 'goForward',
      browser_reload: 'reload',
      reload: 'reload',
      reload_page: 'reload',
      browser_find: 'findText',
      findText: 'findText',
      find_text: 'findText',
      browser_wait: 'wait',
      wait: 'wait',
      extract_page: 'extractPage',
      extractPage: 'extractPage',
      open_tab: 'openTab',
      openTab: 'openTab',
      close_tab: 'closeTab',
      closeTab: 'closeTab',
      switch_tab: 'switchTab',
      switchTab: 'switchTab',
      browser_select: 'select',
      select: 'select',
      press_key: 'pressKey',
      pressKey: 'pressKey',
      get_current_url: 'getCurrentUrl',
      getCurrentUrl: 'getCurrentUrl',
      get_page_title: 'getPageTitle',
      getPageTitle: 'getPageTitle',
      get_page_text: 'getPageText',
      getPageText: 'getPageText',
      get_elements: 'getElements',
      getElements: 'getElements',
      take_screenshot: 'takeScreenshot',
      takeScreenshot: 'takeScreenshot',
    };
    return map[tool] || tool;
  }

  /**
   * click(elementId)
   */
  private async executeClick(params: Record<string, any>, pageContainer?: HTMLElement | null) {
    const elementId = params.element_id || params.element || params.elementId;
    if (!elementId) return { success: false, message: 'ID do elemento não informado para clique.' };

    let targetNode: HTMLElement | null = null;
    if (pageContainer) {
      targetNode = pageContainer.querySelector(
        `[data-vision-id="${elementId}"], [data-morph-id="${elementId}"], #${elementId}`
      );
      if (!targetNode) {
        const iframe = pageContainer.querySelector('iframe') as HTMLIFrameElement | null;
        if (iframe && iframe.contentDocument) {
          targetNode = iframe.contentDocument.querySelector(
            `[data-vision-id="${elementId}"], [data-morph-id="${elementId}"], #${elementId}`
          );
        }
      }

      // Se ainda não achou, procura por botão com texto correspondente ou botão de submit
      if (!targetNode) {
        const searchDoc = (pageContainer.querySelector('iframe') as HTMLIFrameElement | null)?.contentDocument || pageContainer;
        const candidates = searchDoc.querySelectorAll<HTMLElement>('button, [role="button"], input[type="submit"], a');
        for (const cand of Array.from(candidates)) {
          const t = (cand.textContent || (cand as HTMLInputElement).value || '').toLowerCase();
          if (params.text && t.includes(params.text.toLowerCase())) {
            targetNode = cand;
            break;
          }
        }
      }
    }

    const elementMeta = {
      text: targetNode?.textContent || params.text || '',
      id: elementId,
      isSensitive: targetNode?.getAttribute('data-is-sensitive') === 'true',
    };

    // Verificação de Segurança (Ações Sensíveis)
    if (SecurityManager.isSensitiveAction('browser_click', params, elementMeta)) {
      const approved = await confirmationManager.requestConfirmation({
        title: 'Esta ação precisa da sua confirmação.',
        description: `O agente de IA está pronto para clicar em "${elementMeta.text || elementId}". Isso pode realizar pagamentos, enviar formulários ou alterar configurações. Deseja confirmar?`,
        actionType: 'purchase',
        targetElementId: elementId,
      });

      if (!approved) {
        return {
          success: false,
          message: 'Ação cancelada pelo usuário na tela de confirmação.',
          requiresUserConfirmation: true,
        };
      }
    }

    if (targetNode) {
      this.highlightElement(targetNode);
      try {
        targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {}
      await this.wait(200);

      // Dispara eventos reais de clique
      targetNode.focus();
      targetNode.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      targetNode.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      targetNode.click();

      // Se for link <a> com href direto
      if (targetNode.tagName.toLowerCase() === 'a') {
        const anchor = targetNode as HTMLAnchorElement;
        if (anchor.href && (anchor.href.startsWith('http://') || anchor.href.startsWith('https://'))) {
          tabManager.updateActiveTabUrl(anchor.href);
        }
      }

      // Se for botão de submit dentro de formulário
      const form = targetNode.closest('form');
      if (form && (targetNode.getAttribute('type') === 'submit' || targetNode.tagName.toLowerCase() === 'button')) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }

      return {
        success: true,
        message: `Clicou com sucesso em ${elementId} ("${elementMeta.text.slice(0, 30)}").`,
      };
    }

    // Se estiver no handler do motor simulado
    if (this.browserEngineHandler?.handleSimulatedClick) {
      const handled = this.browserEngineHandler.handleSimulatedClick(elementId);
      if (handled) {
        return { success: true, message: `Ação de clique disparada em ${elementId}.` };
      }
    }

    return { success: false, message: `Elemento ${elementId} não encontrado na página.` };
  }

  /**
   * type(elementId, text)
   */
  private async executeType(params: Record<string, any>, pageContainer?: HTMLElement | null) {
    const elementId = params.element_id || params.element || params.elementId;
    const text = params.text || '';
    if (!elementId && !params.text) return { success: false, message: 'Parâmetros insuficientes para digitação.' };

    let targetNode: HTMLElement | null = null;
    if (pageContainer) {
      if (elementId) {
        targetNode = pageContainer.querySelector(
          `[data-vision-id="${elementId}"], [data-morph-id="${elementId}"], #${elementId}, [name="${elementId}"]`
        );
        if (!targetNode) {
          const iframe = pageContainer.querySelector('iframe') as HTMLIFrameElement | null;
          if (iframe && iframe.contentDocument) {
            targetNode = iframe.contentDocument.querySelector(
              `[data-vision-id="${elementId}"], [data-morph-id="${elementId}"], #${elementId}, [name="${elementId}"]`
            );
          }
        }
      }

      // Se não encontrou pelo ID específico, localiza o campo de busca ou o primeiro input de texto
      if (!targetNode) {
        const searchDoc = (pageContainer.querySelector('iframe') as HTMLIFrameElement | null)?.contentDocument || pageContainer;
        targetNode = searchDoc.querySelector<HTMLElement>(
          'input[name="q"], input[type="search"], input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea'
        );
      }
    }

    // Bloqueio de segurança para senhas
    if (targetNode instanceof HTMLInputElement && targetNode.type === 'password') {
      return {
        success: false,
        message: 'Por segurança do Morph Browser, campos de senha protegidos devem ser preenchidos diretamente pelo usuário.',
      };
    }

    if (targetNode && (targetNode instanceof HTMLInputElement || targetNode instanceof HTMLTextAreaElement)) {
      this.highlightElement(targetNode);
      try {
        targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {}
      await this.wait(200);

      targetNode.focus();

      // Dispara eventos de teclado e atualiza o valor
      targetNode.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' }));

      const prototype = targetNode instanceof HTMLInputElement ? window.HTMLInputElement.prototype : window.HTMLTextAreaElement.prototype;
      const nativeSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
      if (nativeSetter) {
        nativeSetter.call(targetNode, text);
      } else {
        targetNode.value = text;
      }

      // Dispara eventos de input e change
      targetNode.dispatchEvent(new Event('input', { bubbles: true }));
      targetNode.dispatchEvent(new Event('change', { bubbles: true }));

      const isSearchBox =
        targetNode.name === 'q' ||
        (targetNode as HTMLInputElement).type === 'search' ||
        /pesquis|busca|search|query|q/i.test(
          targetNode.name || targetNode.id || (targetNode as HTMLInputElement).placeholder || targetNode.getAttribute('aria-label') || ''
        );

      if (params.pressEnter || params.press_enter || isSearchBox) {
        targetNode.dispatchEvent(
          new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13 })
        );
        targetNode.dispatchEvent(
          new KeyboardEvent('keypress', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13 })
        );
        targetNode.dispatchEvent(
          new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key: 'Enter', code: 'Enter', keyCode: 13, which: 13 })
        );
        if (targetNode.form) {
          if (typeof targetNode.form.requestSubmit === 'function') {
            try {
              targetNode.form.requestSubmit();
            } catch {
              targetNode.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
            }
          } else {
            targetNode.form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
          }
        }
      } else {
        targetNode.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter' }));
      }

      return {
        success: true,
        message: `Digitou "${text.slice(0, 30)}" no campo ${elementId || 'de busca'}.`,
      };
    }

    if (this.browserEngineHandler?.handleSimulatedType && elementId) {
      this.browserEngineHandler.handleSimulatedType(elementId, text);
      return { success: true, message: `Texto "${text}" inserido em ${elementId}.` };
    }

    return { success: false, message: `Campo ${elementId || ''} não encontrado para digitação.` };
  }

  /**
   * scroll(direction, amount)
   */
  private async executeScroll(params: Record<string, any>, pageContainer?: HTMLElement | null) {
    const direction = params.direction || 'down';
    const amount = params.amount || 350;
    const delta = direction === 'down' ? amount : -amount;

    if (pageContainer) {
      const iframe = pageContainer.querySelector('iframe') as HTMLIFrameElement | null;
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.scrollBy({ top: delta, behavior: 'smooth' });
        } catch {}
      }
      pageContainer.scrollBy({ top: delta, behavior: 'smooth' });
      await this.wait(250);
    }
    return {
      success: true,
      message: `Rolou a página ${direction === 'down' ? 'para baixo' : 'para cima'} em ${amount}px.`,
    };
  }

  /**
   * openUrl(url)
   */
  private async executeOpenUrl(params: Record<string, any>) {
    const url = params.url;
    if (!url) return { success: false, message: 'URL não fornecida.' };

    const res = await browserController.openUrl(url, true);
    return { success: res.success, message: `Navegando para: ${res.url}` };
  }

  /**
   * goBack()
   */
  private async executeGoBack() {
    if (this.browserEngineHandler?.goBack) {
      this.browserEngineHandler.goBack();
      await this.wait(350);
    }
    return { success: true, message: 'Retornou para a página anterior.' };
  }

  /**
   * goForward()
   */
  private async executeGoForward() {
    if (this.browserEngineHandler?.goForward) {
      this.browserEngineHandler.goForward();
      await this.wait(350);
    }
    return { success: true, message: 'Avançou para a próxima página.' };
  }

  /**
   * reload()
   */
  private async executeReload() {
    if (this.browserEngineHandler?.reload) {
      this.browserEngineHandler.reload();
      await this.wait(400);
    }
    return { success: true, message: 'Página recarregada com sucesso.' };
  }

  /**
   * findText(text)
   */
  private async executeFindText(params: Record<string, any>, pageContainer?: HTMLElement | null) {
    const query = (params.text || '').toLowerCase();
    if (pageContainer) {
      const content = pageContainer.innerText.toLowerCase();
      const found = content.includes(query);
      return {
        success: true,
        message: found ? `Texto "${query}" encontrado na página.` : `Texto "${query}" não foi encontrado.`,
        data: { found },
      };
    }
    return { success: true, message: `Busca por "${query}" concluída.` };
  }

  /**
   * wait(milliseconds)
   */
  private async executeWait(params: Record<string, any>) {
    const ms = Math.min(params.milliseconds || params.duration || 1000, 4000);
    await this.wait(ms);
    return { success: true, message: `Aguardou ${ms}ms.` };
  }

  /**
   * extract_page()
   */
  private async executeExtractPage() {
    let snapshot: PageSnapshot | undefined;
    if (this.browserEngineHandler?.getSnapshot) {
      snapshot = this.browserEngineHandler.getSnapshot();
    }
    const currentTab = tabManager.getActiveTab();
    const url = currentTab?.url || snapshot?.url || '';
    const title = currentTab?.title || snapshot?.title || '';
    return {
      success: true,
      message: `Página observada e extraída com sucesso: "${title}" (${url}).`,
      data: { url, title, elementsCount: snapshot?.elements?.length || 0 },
      newSnapshot: snapshot,
    };
  }

  /**
   * open_tab(url)
   */
  private async executeOpenTab(params: Record<string, any>) {
    const url = params.url || 'morph://home';
    const tab = tabManager.createTab(url);
    return {
      success: true,
      message: `Nova guia aberta (${tab.title}).`,
      data: { tabId: tab.id },
    };
  }

  /**
   * close_tab(tab_id)
   */
  private async executeCloseTab(params: Record<string, any>) {
    const tabId = params.tab_id || params.tabId || tabManager.getActiveTabId();
    tabManager.closeTab(tabId);
    return {
      success: true,
      message: 'Guia fechada com sucesso.',
    };
  }

  /**
   * switch_tab(tab_id)
   */
  private async executeSwitchTab(params: Record<string, any>) {
    const tabId = params.tab_id || params.tabId;
    if (!tabId) return { success: false, message: 'ID da guia não informado.' };
    tabManager.switchTab(tabId);
    return {
      success: true,
      message: `Alternou para a guia com ID ${tabId}.`,
    };
  }

  /**
   * select(elementId, option)
   */
  private async executeSelect(params: Record<string, any>, pageContainer?: HTMLElement | null) {
    const elementId = params.element || params.elementId;
    const option = params.option;
    if (pageContainer) {
      const selectEl = pageContainer.querySelector(`[data-morph-id="${elementId}"]`) as HTMLSelectElement;
      if (selectEl) {
        selectEl.value = option;
        selectEl.dispatchEvent(new Event('change', { bubbles: true }));
        return { success: true, message: `Opção "${option}" selecionada em ${elementId}.` };
      }
    }
    return { success: true, message: `Opção alterada em ${elementId}.` };
  }

  private highlightElement(el: HTMLElement) {
    if (this.activeHighlightElement) {
      this.activeHighlightElement.classList.remove('morph-agent-target');
    }
    this.activeHighlightElement = el;
    el.classList.add('morph-agent-target');

    setTimeout(() => {
      el.classList.remove('morph-agent-target');
    }, 1800);
  }

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const actionExecutor = new ActionExecutor();
