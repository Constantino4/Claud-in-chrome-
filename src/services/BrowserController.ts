import { tabManager } from './TabManager';
import { PageSnapshot } from '../types/browser';
import { PageAnalyzer } from './PageAnalyzer';
import { browserVision } from './BrowserVision';
import { confirmationManager } from './ConfirmationManager';
import { SecurityManager } from './SecurityManager';

export interface BrowserElement {
  id: string;
  type: string;
  text?: string;
  placeholder?: string;
  ariaLabel?: string;
  tag?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  visible?: boolean;
}

export class BrowserController {
  private browserEngineHandler: any = null;
  private openBrowserListeners: Set<() => void> = new Set();
  private closeBrowserListeners: Set<() => void> = new Set();
  private activeHighlightNode: HTMLElement | null = null;

  public setBrowserEngineHandler(handler: any) {
    this.browserEngineHandler = handler;
  }

  public onOpenBrowserView(callback: () => void): () => void {
    this.openBrowserListeners.add(callback);
    return () => this.openBrowserListeners.delete(callback);
  }

  public onCloseBrowserView(callback: () => void): () => void {
    this.closeBrowserListeners.add(callback);
    return () => this.closeBrowserListeners.delete(callback);
  }

  public openBrowserView() {
    this.openBrowserListeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('[BrowserController] Erro ao abrir visão do navegador:', err);
      }
    });
  }

  public closeBrowserView() {
    this.closeBrowserListeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('[BrowserController] Erro ao fechar visão do navegador:', err);
      }
    });
  }

  /**
   * Normaliza qualquer URL ou comando de site para URL válida navegável
   */
  public normalizeUrl(rawUrl: string): string {
    let url = (rawUrl || '').trim();
    if (!url) return 'https://www.google.com';

    // Se já é protocolo completo
    if (/^(https?|morph):\/\//i.test(url)) {
      return url;
    }

    const lower = url.toLowerCase();
    if (lower === 'google' || lower === 'o google' || lower.includes('google.com')) {
      return 'https://www.google.com';
    }
    if (lower === 'youtube' || lower === 'o youtube' || lower.includes('youtube.com')) {
      return 'https://www.youtube.com';
    }
    if (lower === 'tiktok' || lower === 'o tiktok' || lower.includes('tiktok.com')) {
      return 'https://www.tiktok.com';
    }
    if (lower === 'instagram' || lower === 'o instagram' || lower.includes('instagram.com')) {
      return 'https://www.instagram.com';
    }
    if (lower === 'wikipedia' || lower === 'wikipédia' || lower.includes('wikipedia.org')) {
      return 'https://www.wikipedia.org';
    }
    if (lower === 'amazon' || lower.includes('amazon.com')) {
      return 'https://www.amazon.com';
    }
    if (lower === 'netflix' || lower.includes('netflix.com')) {
      return 'https://www.netflix.com';
    }

    // Se parece com um domínio
    if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(url)) {
      return `https://${url}`;
    }

    return `https://${url}`;
  }

  /**
   * 1. openUrl(url) - Abre URL real no navegador interno Morph
   */
  public async openUrl(url: string, shouldOpenUI = true): Promise<{ success: boolean; url: string; title: string; message: string }> {
    const targetUrl = this.normalizeUrl(url);

    // 1. Atualiza TabManager imediatamente
    tabManager.updateActiveTabUrl(targetUrl);

    // 2. Se houver handler registrado pelo BrowserEngine, navega diretamente
    if (this.browserEngineHandler?.navigateTo) {
      this.browserEngineHandler.navigateTo(targetUrl);
    }

    // 3. Abre a interface visual do navegador para o utilizador acompanhar em tempo real
    if (shouldOpenUI) {
      this.openBrowserView();
    }

    // Aguarda início do carregamento
    await this.wait(400);

    const title = this.getPageTitle() || targetUrl;
    return {
      success: true,
      url: targetUrl,
      title,
      message: `Navegador aberto em ${targetUrl}`,
    };
  }

  /**
   * 2. goBack() - Volta à página anterior
   */
  public async goBack(): Promise<{ success: boolean; message: string }> {
    if (this.browserEngineHandler?.goBack) {
      this.browserEngineHandler.goBack();
    } else {
      tabManager.goBack();
    }
    await this.wait(300);
    return { success: true, message: 'Voltou à página anterior.' };
  }

  /**
   * 3. goForward() - Avança no histórico
   */
  public async goForward(): Promise<{ success: boolean; message: string }> {
    if (this.browserEngineHandler?.goForward) {
      this.browserEngineHandler.goForward();
    } else {
      tabManager.goForward();
    }
    await this.wait(300);
    return { success: true, message: 'Avançou para a próxima página.' };
  }

  /**
   * 4. reload() - Atualiza a página atual
   */
  public async reload(): Promise<{ success: boolean; message: string }> {
    if (this.browserEngineHandler?.reload) {
      this.browserEngineHandler.reload();
    } else {
      tabManager.setLoading(true);
      setTimeout(() => tabManager.setLoading(false), 400);
    }
    await this.wait(400);
    return { success: true, message: 'Página atualizada.' };
  }

  /**
   * 5. wait(ms) - Pausa a execução de forma assíncrona
   */
  public async wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
  }

  /**
   * 6. getCurrentUrl() - Obtém o URL atual da página
   */
  public getCurrentUrl(): string {
    if (this.browserEngineHandler?.getCurrentUrl) {
      return this.browserEngineHandler.getCurrentUrl();
    }
    return tabManager.getActiveTab()?.url || 'morph://home';
  }

  /**
   * 7. getPageTitle() - Obtém o título atual da página
   */
  public getPageTitle(): string {
    if (this.browserEngineHandler?.getCurrentTitle) {
      return this.browserEngineHandler.getCurrentTitle();
    }
    return tabManager.getActiveTab()?.title || 'Morph Browser';
  }

  /**
   * 8. getPageText() - Extrai o conteúdo em texto visível da página
   */
  public getPageText(): string {
    const container = this.getContainer();
    if (container) {
      return container.innerText || container.textContent || '';
    }
    const snapshot = this.getSnapshot();
    return snapshot?.mainTextSnippet || '';
  }

  /**
   * 9. getElements() - Obtém a lista estruturada de elementos interativos
   */
  public getElements(): BrowserElement[] {
    const snapshot = this.getSnapshot();
    if (!snapshot || !snapshot.elements) return [];

    return snapshot.elements.map((el) => ({
      id: el.id,
      type: el.category || el.tagName,
      text: el.text,
      placeholder: el.placeholder,
      ariaLabel: el.ariaLabel,
      tag: el.tagName,
      x: el.boundingBox?.x,
      y: el.boundingBox?.y,
      width: el.boundingBox?.width,
      height: el.boundingBox?.height,
      visible: el.isVisible,
    }));
  }

  /**
   * 10. click(elementId) - Clica em um elemento específico
   */
  public async click(elementId: string): Promise<{ success: boolean; message: string; requiresUserConfirmation?: boolean }> {
    const container = this.getContainer();
    let targetNode: HTMLElement | null = null;

    if (container) {
      targetNode = container.querySelector(
        `[data-vision-id="${elementId}"], [data-morph-id="${elementId}"], #${CSS.escape(elementId)}`
      ) as HTMLElement;

      if (!targetNode) {
        // Busca inteligente por texto ou id aproximado
        const allInteractives = Array.from(
          container.querySelectorAll<HTMLElement>('button, a, input, [role="button"], [tabindex]')
        );
        targetNode =
          allInteractives.find((el) => {
            const txt = (el.textContent || el.getAttribute('aria-label') || '').trim().toLowerCase();
            return txt === elementId.toLowerCase() || txt.includes(elementId.toLowerCase());
          }) || null;
      }
    }

    const elementMeta = {
      text: targetNode?.textContent || elementId,
      id: elementId,
      isSensitive: targetNode?.getAttribute('data-is-sensitive') === 'true',
    };

    if (SecurityManager.isSensitiveAction('browser_click', { element_id: elementId }, elementMeta)) {
      const approved = await confirmationManager.requestConfirmation({
        title: 'Esta ação precisa da sua confirmação.',
        description: `O agente está pronto para clicar em "${elementMeta.text}". Deseja continuar?`,
        actionType: 'purchase',
        targetElementId: elementId,
      });

      if (!approved) {
        return { success: false, message: 'Ação cancelada pelo utilizador.', requiresUserConfirmation: true };
      }
    }

    if (targetNode) {
      this.highlight(targetNode);
      try {
        targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {}
      await this.wait(200);

      targetNode.focus();
      targetNode.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      targetNode.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
      targetNode.click();

      // Se for link <a>
      if (targetNode.tagName.toLowerCase() === 'a') {
        const anchor = targetNode as HTMLAnchorElement;
        if (anchor.href && /^https?:\/\//i.test(anchor.href)) {
          this.openUrl(anchor.href);
        }
      }

      await this.wait(300);
      return { success: true, message: `Clicou com sucesso em ${elementId}.` };
    }

    // Tenta fallback via simulated handler do BrowserEngine
    if (this.browserEngineHandler?.handleSimulatedClick) {
      const success = this.browserEngineHandler.handleSimulatedClick(elementId);
      if (success) {
        await this.wait(300);
        return { success: true, message: `Clicou em ${elementId}.` };
      }
    }

    return { success: false, message: `Elemento ${elementId} não encontrado para clique.` };
  }

  /**
   * 11. type(elementId, text, pressEnter) - Escreve texto em campo e opcionalmente submete
   */
  public async type(
    elementId: string,
    text: string,
    pressEnter = true
  ): Promise<{ success: boolean; message: string }> {
    const container = this.getContainer();
    let targetNode: HTMLInputElement | HTMLTextAreaElement | null = null;

    if (container) {
      targetNode = container.querySelector(
        `input[data-vision-id="${elementId}"], textarea[data-vision-id="${elementId}"], [data-morph-id="${elementId}"], input#${CSS.escape(elementId)}, textarea#${CSS.escape(elementId)}`
      ) as HTMLInputElement | HTMLTextAreaElement;

      if (!targetNode) {
        const inputs = Array.from(container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea'));
        targetNode =
          inputs.find((el) => {
            const nameOrPlaceholder = `${el.name} ${el.placeholder} ${el.id} ${el.getAttribute('aria-label') || ''}`.toLowerCase();
            return (
              nameOrPlaceholder.includes(elementId.toLowerCase()) ||
              /pesquis|busca|search|query|q/i.test(nameOrPlaceholder)
            );
          }) || inputs[0] || null;
      }
    }

    if (targetNode) {
      this.highlight(targetNode);
      try {
        targetNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {}
      await this.wait(150);

      targetNode.focus();
      const prototype =
        targetNode instanceof HTMLInputElement ? window.HTMLInputElement.prototype : window.HTMLTextAreaElement.prototype;
      const nativeSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
      if (nativeSetter) {
        nativeSetter.call(targetNode, text);
      } else {
        targetNode.value = text;
      }

      targetNode.dispatchEvent(new Event('input', { bubbles: true }));
      targetNode.dispatchEvent(new Event('change', { bubbles: true }));

      if (pressEnter) {
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
      }

      await this.wait(350);
      return { success: true, message: `Digitou "${text}" no campo ${elementId}.` };
    }

    // Tenta fallback com handler do engine
    if (this.browserEngineHandler?.handleSimulatedType) {
      const ok = this.browserEngineHandler.handleSimulatedType(elementId, text);
      if (ok) {
        await this.wait(350);
        return { success: true, message: `Digitou "${text}" em ${elementId}.` };
      }
    }

    return { success: false, message: `Campo ${elementId} não encontrado para digitação.` };
  }

  /**
   * 12. pressKey(key, elementId) - Pressiona uma tecla específica
   */
  public async pressKey(key: string, elementId?: string): Promise<{ success: boolean; message: string }> {
    const container = this.getContainer();
    let targetNode: HTMLElement | null = null;
    if (elementId && container) {
      targetNode = container.querySelector(`[data-vision-id="${elementId}"], [data-morph-id="${elementId}"]`);
    }
    const target = targetNode || (container?.ownerDocument.activeElement as HTMLElement) || container || window;

    target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key }));
    target.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, cancelable: true, key }));
    target.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, cancelable: true, key }));
    await this.wait(200);

    return { success: true, message: `Pressionou a tecla "${key}".` };
  }

  /**
   * 13. scroll(direction, amount) - Rola a página
   */
  public async scroll(direction: 'up' | 'down', amount = 350): Promise<{ success: boolean; message: string }> {
    const delta = direction === 'down' ? amount : -amount;
    const container = this.getContainer();

    if (container) {
      const iframe = container.querySelector('iframe') as HTMLIFrameElement | null;
      if (iframe && iframe.contentWindow) {
        try {
          iframe.contentWindow.scrollBy({ top: delta, behavior: 'smooth' });
        } catch {}
      }
      container.scrollBy({ top: delta, behavior: 'smooth' });
      await this.wait(250);
    }
    return { success: true, message: `Rolou ${direction === 'down' ? 'para baixo' : 'para cima'} em ${amount}px.` };
  }

  /**
   * 14. takeScreenshot() - Captura screenshot visual da página atual
   */
  public async takeScreenshot(): Promise<{ success: boolean; screenshot: string | null }> {
    const container = this.getContainer();
    const currentTab = tabManager.getActiveTab();
    if (!container || !currentTab) {
      return { success: false, screenshot: null };
    }

    try {
      const vision = await browserVision.captureFullVision(
        container,
        currentTab.url,
        currentTab.title || 'Morph Browser',
        true
      );
      return { success: true, screenshot: vision.screenshot || null };
    } catch (err) {
      return { success: false, screenshot: null };
    }
  }

  // Métodos auxiliares de contexto
  private getContainer(): HTMLElement | null {
    if (this.browserEngineHandler?.getContainer) {
      return this.browserEngineHandler.getContainer();
    }
    return null;
  }

  private getSnapshot(): PageSnapshot | null {
    if (this.browserEngineHandler?.getSnapshot) {
      return this.browserEngineHandler.getSnapshot();
    }
    return tabManager.getActiveTab()?.snapshot || null;
  }

  private highlight(node: HTMLElement) {
    if (this.activeHighlightNode) {
      this.activeHighlightNode.style.outline = '';
      this.activeHighlightNode.style.boxShadow = '';
    }
    node.style.outline = '3px solid #06b6d4';
    node.style.boxShadow = '0 0 16px rgba(6, 182, 212, 0.6)';
    node.style.transition = 'all 0.2s ease-in-out';
    this.activeHighlightNode = node;

    setTimeout(() => {
      if (this.activeHighlightNode === node) {
        node.style.outline = '';
        node.style.boxShadow = '';
        this.activeHighlightNode = null;
      }
    }, 1800);
  }
}

export const browserController = new BrowserController();
