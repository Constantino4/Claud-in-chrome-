import { PageElement, PageSnapshot, ProductItem } from '../types/browser';
import { SecurityManager } from './SecurityManager';

export class PageAnalyzer {
  /**
   * Analisa a página atual no navegador e produz uma representação estruturada
   * contendo: título, URL, textos relevantes, headings, links, botões, inputs,
   * selects, textareas, formulários, imagens e preços identificáveis.
   * Atribui identificadores estruturados únicos (BUTTON_01, INPUT_01, etc).
   */
  public static analyzeDOM(rootElement: HTMLElement, currentUrl: string, pageTitle: string): PageSnapshot {
    const elements: PageElement[] = [];
    const headings: string[] = [];
    const products: ProductItem[] = [];
    const images: { id: string; alt: string; src: string }[] = [];
    const forms: any[] = [];

    let buttonCount = 1;
    let inputCount = 1;
    let textareaCount = 1;
    let linkCount = 1;
    let selectCount = 1;
    let imageCount = 1;
    let formCount = 1;
    let productCount = 1;

    // Se a página for um site real embutido via iframe
    let targetRoot: Document | HTMLElement = rootElement;
    const iframe = rootElement.querySelector('iframe') as HTMLIFrameElement | null;
    if (iframe && iframe.contentDocument && iframe.contentDocument.body) {
      targetRoot = iframe.contentDocument.body;
      if (iframe.contentDocument.title) {
        pageTitle = iframe.contentDocument.title;
      }
    }

    // 1. Coleta Títulos e Headings (h1, h2, h3, h4)
    const headingNodes = targetRoot.querySelectorAll('h1, h2, h3, h4');
    headingNodes.forEach((node) => {
      const text = (node.textContent || '').trim();
      if (text) {
        headings.push(text);
      }
    });

    // 2. Coleta Formulários
    const formNodes = targetRoot.querySelectorAll('form');
    formNodes.forEach((formEl) => {
      const formId = `FORM_${String(formCount++).padStart(2, '0')}`;
      formEl.setAttribute('data-morph-id', formId);
      forms.push({
        id: formId,
        action: formEl.getAttribute('action') || undefined,
        fields: [],
      });
    });

    // 3. Coleta Botões
    const buttonNodes = targetRoot.querySelectorAll(
      'button, [role="button"], input[type="submit"], input[type="button"], a.btn, .button'
    );
    buttonNodes.forEach((node) => {
      const text = (node.textContent || (node as HTMLInputElement).value || '').trim();
      const id = `BUTTON_${String(buttonCount++).padStart(2, '0')}`;
      node.setAttribute('data-morph-id', id);

      const isSensitive = /comprar|finalizar|pagar|checkout|enviar|deletar|excluir|pay|delete|transferir/i.test(text);

      elements.push({
        id,
        tagName: node.tagName.toLowerCase(),
        type: (node as HTMLInputElement).type || 'button',
        text: text.slice(0, 80),
        category: 'button',
        disabled: (node as HTMLButtonElement).disabled,
        isSensitive,
        attributes: {
          class: node.className || '',
          id: node.id || '',
        },
      });
    });

    // 4. Coleta Inputs (text, search, email, tel, password, number, etc.)
    const inputNodes = targetRoot.querySelectorAll('input:not([type="submit"]):not([type="button"]):not([type="hidden"])');
    inputNodes.forEach((node) => {
      const inputEl = node as HTMLInputElement;
      const type = (inputEl.type || 'text').toLowerCase();
      const id = `INPUT_${String(inputCount++).padStart(2, '0')}`;
      node.setAttribute('data-morph-id', id);

      const placeholder = inputEl.placeholder || '';
      const label = this.findAssociatedLabel(inputEl, targetRoot as HTMLElement);
      const isPassword = type === 'password';

      elements.push({
        id,
        tagName: 'input',
        type,
        text: label || placeholder || inputEl.name || '',
        placeholder,
        value: isPassword ? '[PROTEGIDO - DIGITAÇÃO DIRETA PELO USUÁRIO]' : inputEl.value,
        category: 'input',
        isSensitive: isPassword || /cpf|cartao|senha|credit|cvv/i.test(label + placeholder + inputEl.name),
      });
    });

    // 5. Coleta Textareas
    const textareaNodes = targetRoot.querySelectorAll('textarea');
    textareaNodes.forEach((node) => {
      const textareaEl = node as HTMLTextAreaElement;
      const id = `TEXTAREA_${String(textareaCount++).padStart(2, '0')}`;
      node.setAttribute('data-morph-id', id);

      const placeholder = textareaEl.placeholder || '';
      const label = this.findAssociatedLabel(textareaEl, targetRoot as HTMLElement);

      elements.push({
        id,
        tagName: 'textarea',
        text: label || placeholder || textareaEl.name || '',
        placeholder,
        value: textareaEl.value,
        category: 'textarea',
      });
    });

    // 6. Coleta Selects
    const selectNodes = targetRoot.querySelectorAll('select');
    selectNodes.forEach((node) => {
      const selectEl = node as HTMLSelectElement;
      const id = `SELECT_${String(selectCount++).padStart(2, '0')}`;
      node.setAttribute('data-morph-id', id);

      const label = this.findAssociatedLabel(selectEl, targetRoot as HTMLElement);
      const optionsText = Array.from(selectEl.options)
        .map((opt) => opt.text || opt.value)
        .join(', ');

      elements.push({
        id,
        tagName: 'select',
        text: label || selectEl.name || 'Seleção',
        value: selectEl.value,
        placeholder: optionsText.slice(0, 100),
        category: 'select',
      });
    });

    // 7. Coleta Links
    const linkNodes = targetRoot.querySelectorAll('a[href]');
    linkNodes.forEach((node) => {
      const aEl = node as HTMLAnchorElement;
      const text = (aEl.textContent || '').trim();
      if (!text || text.length > 100) return;

      const id = `LINK_${String(linkCount++).padStart(2, '0')}`;
      aEl.setAttribute('data-morph-id', id);

      elements.push({
        id,
        tagName: 'a',
        href: aEl.href || aEl.getAttribute('href') || '',
        text: text.replace(/\s+/g, ' '),
        category: 'link',
      });
    });

    // 8. Coleta Imagens
    const imageNodes = targetRoot.querySelectorAll('img');
    imageNodes.forEach((node) => {
      const imgEl = node as HTMLImageElement;
      const alt = (imgEl.alt || '').trim();
      const src = imgEl.src || imgEl.getAttribute('src') || '';
      if (!alt && !src) return;

      const id = `IMAGE_${String(imageCount++).padStart(2, '0')}`;
      imgEl.setAttribute('data-morph-id', id);
      images.push({
        id,
        alt: alt || 'Imagem sem descrição',
        src: src.slice(0, 120),
      });
    });

    // 9. Coleta Cartões de Produtos e Preços
    const productCards = targetRoot.querySelectorAll('[data-product-card], .product-card, .product-item');
    productCards.forEach((card) => {
      const nameEl = card.querySelector('[data-product-name], h2, h3, .product-title, .title');
      const priceEl = card.querySelector('[data-product-price], .price, .product-price');
      const buyBtn = card.querySelector('button, [data-morph-id^="BUTTON_"]');

      const name = (nameEl?.textContent || '').trim();
      const priceStr = (priceEl?.textContent || '').trim();
      const numPrice = this.extractNumericPrice(priceStr);

      if (name && priceStr) {
        products.push({
          id: `PROD_${String(productCount++).padStart(2, '0')}`,
          name,
          price: priceStr,
          numericPrice: numPrice,
          buyElementId: buyBtn?.getAttribute('data-morph-id') || undefined,
        });
      }
    });

    // 10. Resumo de Texto Principal Relevante
    const mainTextSnippet = (rootElement.innerText || rootElement.textContent || '')
      .slice(0, 1500)
      .replace(/\s+/g, ' ')
      .trim();

    // Aplica mascaramento de segurança
    const protectedElements = SecurityManager.maskCredentials(elements);

    // Constrói snapshot estruturado
    const snapshot: PageSnapshot = {
      url: currentUrl,
      title: pageTitle || 'Página Web',
      headings: headings.slice(0, 12),
      mainTextSnippet,
      elements: protectedElements,
      products,
      images: images.slice(0, 10),
      forms,
      timestamp: Date.now(),
    };

    snapshot.structuredText = this.generateStructuredPrompt(snapshot);
    return snapshot;
  }

  /**
   * Produz a estrutura compacta solicitada para o envio à Gemini:
   * { "url": "https://example.com", "title": "Example", "elements": [ { "id": "INPUT_01", "type": "input", "placeholder": "Pesquisar" }, { "id": "BUTTON_01", "type": "button", "text": "Pesquisar" } ] }
   */
  public static getCompactPageContext(snapshot: PageSnapshot): {
    url: string;
    title: string;
    elements: { id: string; type: string; text?: string; placeholder?: string; isSensitive?: boolean }[];
    headings?: string[];
    snippet?: string;
  } {
    return {
      url: snapshot.url,
      title: snapshot.title,
      elements: (snapshot.elements || []).slice(0, 50).map((el) => ({
        id: el.id,
        type: el.category || el.tagName,
        text: el.text ? el.text.slice(0, 60) : undefined,
        placeholder: el.placeholder ? el.placeholder.slice(0, 60) : undefined,
        isSensitive: el.isSensitive || undefined,
      })),
      headings: snapshot.headings?.slice(0, 6),
      snippet: snapshot.mainTextSnippet ? snapshot.mainTextSnippet.slice(0, 600) : undefined,
    };
  }

  /**
   * Produz a representação textual exata solicitada pela especificação do Morph Browser AI:
   *
   * PAGE
   * URL: https://example.com
   * ELEMENTS:
   * BUTTON_01 Texto: Pesquisar
   * INPUT_01 Placeholder: Pesquisar produtos
   * LINK_01 Texto: Produtos
   * LINK_02 Texto: Entrar
   */
  public static generateStructuredPrompt(snapshot: PageSnapshot): string {
    const lines: string[] = [];
    lines.push('PAGE');
    lines.push(`URL: ${snapshot.url}`);
    lines.push(`TITLE: ${snapshot.title}`);
    lines.push('');

    if (snapshot.headings.length > 0) {
      lines.push('HEADINGS:');
      snapshot.headings.forEach((h) => lines.push(`- ${h}`));
      lines.push('');
    }

    lines.push('ELEMENTS:');
    snapshot.elements.forEach((el) => {
      let desc = '';
      if (el.category === 'button') {
        desc = `Texto: ${el.text}`;
      } else if (el.category === 'input') {
        desc = el.placeholder ? `Placeholder: ${el.placeholder}` : `Rótulo: ${el.text}`;
        if (el.value && !el.value.includes('PROTEGIDO')) {
          desc += ` (Valor Atual: "${el.value}")`;
        }
      } else if (el.category === 'textarea') {
        desc = el.placeholder ? `Placeholder: ${el.placeholder}` : `Rótulo: ${el.text}`;
        if (el.value) {
          desc += ` (Valor: "${el.value.slice(0, 40)}")`;
        }
      } else if (el.category === 'select') {
        desc = `Rótulo: ${el.text} (Opções: ${el.placeholder || 'N/A'})`;
      } else if (el.category === 'link') {
        desc = `Texto: ${el.text} -> ${el.href || '#'}`;
      } else {
        desc = `${el.category}: ${el.text}`;
      }

      if (el.isSensitive) {
        desc += ' [AÇÃO SENSÍVEL - REQUER CONFIRMAÇÃO DO USUÁRIO]';
      }

      lines.push(`${el.id} ${desc}`);
    });

    if (snapshot.products && snapshot.products.length > 0) {
      lines.push('');
      lines.push('PREÇOS E PRODUTOS IDENTIFICADOS:');
      snapshot.products.forEach((p) => {
        lines.push(`- ${p.id} ${p.name}: ${p.price} (Botão de Compra: ${p.buyElementId || 'N/A'})`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Encontra rótulo associado a um input ou textarea
   */
  private static findAssociatedLabel(input: HTMLElement, root: HTMLElement): string {
    if (input.id) {
      const label = root.querySelector(`label[for="${input.id}"]`);
      if (label?.textContent) return label.textContent.trim();
    }
    const parentLabel = input.closest('label');
    if (parentLabel?.textContent) {
      return parentLabel.textContent.replace(input.outerHTML, '').trim();
    }
    return '';
  }

  /**
   * Converte strings de preço como "R$ 799,00" ou "$99.99" em número float
   */
  public static extractNumericPrice(priceStr: string): number {
    const cleaned = priceStr.replace(/[^0-9.,]/g, '').trim();
    if (!cleaned) return 0;

    if (cleaned.includes(',') && cleaned.includes('.')) {
      // Ex: 1.299,00
      return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
    } else if (cleaned.includes(',')) {
      // Ex: 799,00
      return parseFloat(cleaned.replace(',', '.'));
    }
    return parseFloat(cleaned) || 0;
  }
}
