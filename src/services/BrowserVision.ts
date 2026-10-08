import html2canvas from 'html2canvas';
import { VisionElement, VisionSnapshot } from '../types/browser';

export class BrowserVisionService {
  private debugMode: boolean = true;
  private lastSnapshot: VisionSnapshot | null = null;
  private listeners: ((snapshot: VisionSnapshot) => void)[] = [];

  public setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  public isDebugEnabled(): boolean {
    return this.debugMode;
  }

  public getLastSnapshot(): VisionSnapshot | null {
    return this.lastSnapshot;
  }

  public subscribe(listener: (snapshot: VisionSnapshot) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(snapshot: VisionSnapshot): void {
    this.listeners.forEach((l) => {
      try {
        l(snapshot);
      } catch (err) {
        console.error('[BrowserVision] Erro no listener:', err);
      }
    });
  }

  /**
   * 1. Captura e analisa a estrutura do DOM da página atual (SOMENTE LEITURA).
   * Identifica inputs, botões, links, menus, imagens, posições e textos importantes.
   * Atribui identificadores sequenciais seguros (element-1, element-2, etc.).
   */
  public captureDOM(container: HTMLElement, url: string, title: string): VisionSnapshot {
    const elements: VisionElement[] = [];
    const headings: string[] = [];
    let elementCounter = 1;

    let searchRoot: HTMLElement = container;
    const iframe = container.querySelector('iframe') as HTMLIFrameElement | null;
    if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
      searchRoot = iframe.contentDocument.body;
      if (iframe.contentDocument.title) {
        title = iframe.contentDocument.title;
      }
    }

    const containerRect = searchRoot.getBoundingClientRect();

    // 1. Extrai Headings
    const headingNodes = searchRoot.querySelectorAll('h1, h2, h3, h4');
    headingNodes.forEach((node) => {
      const text = (node.textContent || '').trim();
      if (text) {
        headings.push(text);
      }
    });

    // Função utilitária para calcular bounding box e visibilidade
    const computeBoundsAndVisibility = (node: HTMLElement) => {
      const rect = node.getBoundingClientRect();
      const style = window.getComputedStyle(node);
      const isDisplayNone = style.display === 'none';
      const isHidden = style.visibility === 'hidden' || style.opacity === '0';
      const hasSize = rect.width > 0 && rect.height > 0;
      const visible = !isDisplayNone && !isHidden && hasSize;

      // Posição relativa ao container do navegador
      const x = Math.round(rect.left - containerRect.left);
      const y = Math.round(rect.top - containerRect.top);
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);

      return { x, y, width, height, visible };
    };

    // 2. Extrai Campos de Entrada (Inputs)
    const inputNodes = searchRoot.querySelectorAll<HTMLInputElement>(
      'input:not([type="submit"]):not([type="button"]):not([type="hidden"])'
    );
    inputNodes.forEach((node) => {
      const id = `element-${elementCounter++}`;
      node.setAttribute('data-vision-id', id);
      // Mantém compatibilidade com data-morph-id
      if (!node.getAttribute('data-morph-id')) {
        node.setAttribute('data-morph-id', id);
      }

      const bounds = computeBoundsAndVisibility(node);
      const placeholder = node.placeholder || '';
      const ariaLabel = node.getAttribute('aria-label') || '';
      const role = node.getAttribute('role') || 'textbox';
      const isPassword = (node.type || '').toLowerCase() === 'password';

      // Rótulo visível ou associado
      let text = ariaLabel || placeholder;
      if (node.id) {
        const label = searchRoot.querySelector(`label[for="${node.id}"]`);
        if (label?.textContent) {
          text = label.textContent.trim();
        }
      }

      elements.push({
        id,
        type: 'input',
        text: text.slice(0, 80),
        placeholder,
        ariaLabel,
        role,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        visible: bounds.visible,
        disabled: node.disabled || false,
        tagName: 'input',
        name: node.name || '',
      });
    });

    // 3. Extrai Botões (Buttons, [role="button"], submit)
    const buttonNodes = searchRoot.querySelectorAll<HTMLElement>(
      'button, [role="button"], input[type="submit"], input[type="button"], a.btn, .btn'
    );
    buttonNodes.forEach((node) => {
      const id = `element-${elementCounter++}`;
      node.setAttribute('data-vision-id', id);
      if (!node.getAttribute('data-morph-id')) {
        node.setAttribute('data-morph-id', id);
      }

      const bounds = computeBoundsAndVisibility(node);
      const text = (node.textContent || (node as HTMLInputElement).value || '').trim();
      const ariaLabel = node.getAttribute('aria-label') || '';
      const role = node.getAttribute('role') || 'button';
      const disabled = (node as HTMLButtonElement).disabled || node.getAttribute('aria-disabled') === 'true';

      elements.push({
        id,
        type: 'button',
        text: (text || ariaLabel).slice(0, 80),
        placeholder: '',
        ariaLabel,
        role,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        visible: bounds.visible,
        disabled: !!disabled,
        tagName: node.tagName.toLowerCase(),
      });
    });

    // 4. Extrai Links
    const linkNodes = searchRoot.querySelectorAll<HTMLAnchorElement>('a[href], [role="link"]');
    linkNodes.forEach((node) => {
      const id = `element-${elementCounter++}`;
      node.setAttribute('data-vision-id', id);
      if (!node.getAttribute('data-morph-id')) {
        node.setAttribute('data-morph-id', id);
      }

      const bounds = computeBoundsAndVisibility(node);
      const text = (node.textContent || '').trim();
      const ariaLabel = node.getAttribute('aria-label') || '';
      const href = node.getAttribute('href') || undefined;

      elements.push({
        id,
        type: 'link',
        text: (text || ariaLabel).slice(0, 80),
        placeholder: '',
        ariaLabel,
        role: 'link',
        href,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        visible: bounds.visible,
        disabled: false,
        tagName: 'a',
      });
    });

    // 5. Extrai Menus e Barras de Navegação
    const menuNodes = searchRoot.querySelectorAll<HTMLElement>(
      'nav, [role="navigation"], [role="menu"], [role="menubar"], ul.menu, header nav'
    );
    menuNodes.forEach((node) => {
      const id = `element-${elementCounter++}`;
      node.setAttribute('data-vision-id', id);

      const bounds = computeBoundsAndVisibility(node);
      const ariaLabel = node.getAttribute('aria-label') || 'Menu de navegação';
      const text = (node.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100);

      elements.push({
        id,
        type: 'menu',
        text,
        ariaLabel,
        role: node.getAttribute('role') || 'navigation',
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        visible: bounds.visible,
        disabled: false,
        tagName: node.tagName.toLowerCase(),
      });
    });

    // 6. Extrai Textareas
    const textareaNodes = searchRoot.querySelectorAll<HTMLTextAreaElement>('textarea');
    textareaNodes.forEach((node) => {
      const id = `element-${elementCounter++}`;
      node.setAttribute('data-vision-id', id);
      if (!node.getAttribute('data-morph-id')) {
        node.setAttribute('data-morph-id', id);
      }

      const bounds = computeBoundsAndVisibility(node);
      const placeholder = node.placeholder || '';
      const ariaLabel = node.getAttribute('aria-label') || '';

      elements.push({
        id,
        type: 'textarea',
        text: node.value || placeholder || '',
        placeholder,
        ariaLabel,
        role: 'textbox',
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        visible: bounds.visible,
        disabled: node.disabled || false,
        tagName: 'textarea',
      });
    });

    // 7. Extrai Imagens com significado
    const imageNodes = searchRoot.querySelectorAll<HTMLImageElement>('img, svg[aria-label]');
    imageNodes.forEach((node) => {
      const id = `element-${elementCounter++}`;
      node.setAttribute('data-vision-id', id);

      const bounds = computeBoundsAndVisibility(node);
      const alt = (node as HTMLImageElement).alt || node.getAttribute('aria-label') || '';
      const src = (node as HTMLImageElement).src || undefined;

      elements.push({
        id,
        type: 'image',
        text: alt || 'Imagem',
        ariaLabel: alt,
        role: 'img',
        href: src,
        x: bounds.x,
        y: bounds.y,
        width: bounds.width,
        height: bounds.height,
        visible: bounds.visible,
        disabled: false,
        tagName: node.tagName.toLowerCase(),
      });
    });

    // 8. Extrai Texto Visível Geral Relevante (parágrafos, textos principais)
    const textSnippets: string[] = [];
    const textNodes = searchRoot.querySelectorAll('p, article, section, [role="main"], main');
    textNodes.forEach((node) => {
      const text = (node.textContent || '').trim().replace(/\s+/g, ' ');
      if (text.length > 20 && !textSnippets.includes(text)) {
        textSnippets.push(text.slice(0, 250));
      }
    });

    const visibleText = textSnippets.slice(0, 10).join('\n\n') || searchRoot.innerText?.slice(0, 800) || container.innerText.slice(0, 800);

    const snapshot: VisionSnapshot = {
      page: {
        url,
        title: title || 'Página Web',
      },
      elements,
      visibleText,
      headings: headings.slice(0, 8),
      screenshotAvailable: false,
      timestamp: Date.now(),
    };

    return snapshot;
  }

  /**
   * 2. Captura Screenshot da área visível da página quando a arquitetura permite.
   * Utiliza html2canvas de forma resiliente e segura.
   */
  public async captureScreenshot(container: HTMLElement): Promise<string | null> {
    try {
      if (!container) return null;

      const iframe = container.querySelector('iframe') as HTMLIFrameElement | null;
      const targetElement = (iframe && iframe.contentDocument && iframe.contentDocument.body)
        ? iframe.contentDocument.body
        : container;

      // Executa captura via html2canvas com configurações otimizadas
      const canvas = await html2canvas(targetElement, {
        logging: false,
        useCORS: true,
        allowTaint: true,
        scale: 1, // 1x scale para velocidade e leveza
        backgroundColor: '#0f172a',
        ignoreElements: (element) => {
          // Ignora overlays de debug ou modais flutuantes
          return element.classList?.contains('vision-ignore') || false;
        },
      });

      const base64 = canvas.toDataURL('image/png', 0.85);
      return base64;
    } catch (err: any) {
      if (this.debugMode) {
        console.warn('[BrowserVision] Erro na captura de screenshot do DOM:', err?.message || err);
      }
      return null;
    }
  }

  /**
   * 3. Captura Completa da Visão: DOM + Screenshot
   */
  public async captureFullVision(
    container: HTMLElement,
    url: string,
    title: string,
    includeScreenshot: boolean = true
  ): Promise<VisionSnapshot> {
    const domSnapshot = this.captureDOM(container, url, title);

    let screenshotBase64: string | null = null;
    if (includeScreenshot) {
      screenshotBase64 = await this.captureScreenshot(container);
    }

    const fullSnapshot: VisionSnapshot = {
      ...domSnapshot,
      screenshotAvailable: !!screenshotBase64,
      screenshotBase64: screenshotBase64 || undefined,
    };

    this.lastSnapshot = fullSnapshot;
    this.notify(fullSnapshot);

    // Debug no Console conforme Requirement #8
    if (this.debugMode) {
      console.log('👁️ [BrowserVision] Relatório de Visão:');
      console.log(`[BrowserVision] URL: ${fullSnapshot.page.url}`);
      console.log(`[BrowserVision] Título: ${fullSnapshot.page.title}`);
      console.log(`[BrowserVision] Elementos encontrados: ${fullSnapshot.elements.length}`);
      console.log(`[BrowserVision] Textos encontrados: ${fullSnapshot.headings.length} títulos, ${fullSnapshot.visibleText.length} caracteres`);
      console.log(`[BrowserVision] Screenshot disponível: ${fullSnapshot.screenshotAvailable ? 'Sim' : 'Não'}`);
    }

    return fullSnapshot;
  }

  /**
   * 4. Envia o snapshot (DOM + Screenshot multimodal) para a Gemini Vision analisar.
   * Perguntas suportadas:
   * - "O que existe nesta página?"
   * - "Onde está a caixa de pesquisa?"
   * - "Quais botões estão visíveis?"
   * - "Qual é o texto principal?"
   * - "Existe algum menu?"
   */
  public async analyzeWithGeminiVision(
    snapshot: VisionSnapshot,
    userQuestion: string = 'O que existe nesta página?'
  ): Promise<{
    answer: string;
    elementsSummary: string[];
    searchBoxFound?: boolean;
    error?: string;
  }> {
    try {
      const response = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: snapshot.page,
          elements: snapshot.elements.slice(0, 60),
          visibleText: snapshot.visibleText,
          headings: snapshot.headings,
          screenshotBase64: snapshot.screenshotBase64,
          userQuestion,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro na rota de visão: ${response.status}`);
      }

      const data = await response.json();
      return {
        answer: data.answer || 'Análise visual concluída com sucesso.',
        elementsSummary: data.elementsSummary || [],
        searchBoxFound: data.searchBoxFound,
      };
    } catch (err: any) {
      if (this.debugMode) {
        console.error('[BrowserVision] Erro de comunicação com Gemini Vision:', err);
      }
      return {
        answer: this.generateLocalVisionFallback(snapshot, userQuestion),
        elementsSummary: snapshot.elements.slice(0, 6).map((el) => `${el.type}: ${el.text || el.placeholder || el.id}`),
        searchBoxFound: snapshot.elements.some((el) => el.type === 'input' && /pesquis|busca|search/i.test(el.placeholder || el.text)),
        error: 'Conexão com Gemini Vision em modo de contingência local.',
      };
    }
  }

  /**
   * Análise local inteligente em caso de falha de conexão com a API
   */
  private generateLocalVisionFallback(snapshot: VisionSnapshot, question: string): string {
    const q = question.toLowerCase();
    const inputs = snapshot.elements.filter((e) => e.type === 'input');
    const buttons = snapshot.elements.filter((e) => e.type === 'button');
    const links = snapshot.elements.filter((e) => e.type === 'link');
    const searchInput = inputs.find((e) => /pesquis|busca|search/i.test(e.placeholder || e.text || '')) || inputs[0];

    if (/onde.*(caixa|campo|barra).*(pesquisa|busca)/i.test(q)) {
      if (searchInput) {
        return `A caixa de pesquisa é o elemento **${searchInput.id}** (${searchInput.placeholder ? `"${searchInput.placeholder}"` : 'Campo de texto'}), localizado na posição aproximada (X: ${searchInput.x}px, Y: ${searchInput.y}px com largura de ${searchInput.width}px).`;
      }
      return 'Não encontrei uma caixa de pesquisa nesta página.';
    }

    if (/quais.*bot[õo]es/i.test(q)) {
      if (buttons.length > 0) {
        return `Existem ${buttons.length} botões visíveis identificados:\n` +
          buttons.slice(0, 8).map((b) => `• **${b.id}**: "${b.text}" (${b.disabled ? 'Desativado' : 'Ativo'})`).join('\n');
      }
      return 'Nenhum botão explícito foi identificado nesta página.';
    }

    if (/menu/i.test(q)) {
      const menus = snapshot.elements.filter((e) => e.type === 'menu');
      if (menus.length > 0) {
        return `Identifiquei menus de navegação (${menus.map((m) => m.id).join(', ')}) com opções de acesso rápido.`;
      }
      return 'Não foi identificado um menu de navegação explícito na estrutura desta página.';
    }

    if (/texto principal/i.test(q)) {
      return `O texto principal da página **${snapshot.page.title}** aborda:\n\n${snapshot.visibleText.slice(0, 300)}...`;
    }

    // Resposta geral sobre "O que existe nesta página?"
    return `### Visão da Página: ${snapshot.page.title}\n` +
      `• **URL:** \`${snapshot.page.url}\`\n` +
      `• **Elementos identificados:** ${snapshot.elements.length} (${inputs.length} campos, ${buttons.length} botões, ${links.length} links)\n` +
      (searchInput ? `• **Caixa de pesquisa:** Disponível em \`${searchInput.id}\` ("${searchInput.placeholder || searchInput.text}")\n` : '') +
      (snapshot.headings.length > 0 ? `• **Seções principais:** ${snapshot.headings.slice(0, 4).join(', ')}\n` : '') +
      `• **Screenshot:** ${snapshot.screenshotAvailable ? 'Capturado com sucesso' : 'Indisponível nesta visualização'}`;
  }
}

export const browserVision = new BrowserVisionService();
