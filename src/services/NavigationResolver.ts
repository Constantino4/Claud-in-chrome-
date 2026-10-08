/**
 * NavigationResolver: Reconhece comandos e intenções de navegação do usuário
 * e mapeia sites conhecidos com URLs oficiais e seguras.
 */
export interface NavigationIntent {
  isNavigation: boolean;
  targetUrl?: string;
  siteName?: string;
  hasSubsequentSearch?: boolean;
  searchQuery?: string;
  subsequentAction?: string;
}

export class NavigationResolver {
  public static readonly KNOWN_SITES: Record<string, { url: string; name: string }> = {
    google: { url: 'https://www.google.com', name: 'Google' },
    youtube: { url: 'https://www.youtube.com', name: 'YouTube' },
    wikipedia: { url: 'https://www.wikipedia.org', name: 'Wikipédia' },
    wikipédia: { url: 'https://www.wikipedia.org', name: 'Wikipédia' },
    wiki: { url: 'https://www.wikipedia.org', name: 'Wikipédia' },
    github: { url: 'https://github.com', name: 'GitHub' },
    amazon: { url: 'https://www.amazon.com', name: 'Amazon' },
    reddit: { url: 'https://www.reddit.com', name: 'Reddit' },
    twitter: { url: 'https://twitter.com', name: 'Twitter' },
    x: { url: 'https://twitter.com', name: 'X' },
    // Telas e serviços internos do Morph Browser
    techshop: { url: 'morph://techshop', name: 'TechShop Loja' },
    loja: { url: 'morph://techshop', name: 'TechShop Loja' },
    contato: { url: 'morph://contact', name: 'Central de Contato' },
    suporte: { url: 'morph://contact', name: 'Central de Contato' },
    formulario: { url: 'morph://contact', name: 'Formulário' },
    formulário: { url: 'morph://contact', name: 'Formulário' },
    booking: { url: 'morph://booking', name: 'Morph Viagens & Reservas' },
    viagens: { url: 'morph://booking', name: 'Morph Viagens & Reservas' },
    reservas: { url: 'morph://booking', name: 'Morph Viagens & Reservas' },
    voos: { url: 'morph://booking', name: 'Morph Viagens & Reservas' },
    wikimorph: { url: 'morph://wiki', name: 'WikiMorph' },
    home: { url: 'morph://home', name: 'Morph Início' },
    inicio: { url: 'morph://home', name: 'Morph Início' },
    início: { url: 'morph://home', name: 'Morph Início' },
  };

  /**
   * Analisa a mensagem do usuário para identificar comandos explícitos de navegação.
   */
  public static resolve(userInput: string): NavigationIntent {
    if (!userInput || !userInput.trim()) {
      return { isNavigation: false };
    }

    // Limpeza de pontuação de borda e normalização
    const raw = userInput.trim();
    const clean = raw.replace(/^[.,!?;:'"“”`()]+|[.,!?;:'"“”`()]+$/g, '').trim();
    const lower = clean.toLowerCase();

    // 1. Verifica se contém uma URL explícita (http://, https://, morph://)
    const protocolMatch = clean.match(/(?:https?|morph):\/\/[^\s"'<>]+/i);
    if (protocolMatch) {
      const explicitUrl = protocolMatch[0].replace(/[.,!?;:]+$/, '');
      let domainLabel = explicitUrl;
      try {
        const u = new URL(explicitUrl);
        domainLabel = u.hostname.replace(/^www\./, '');
      } catch {
        domainLabel = explicitUrl;
      }
      return {
        isNavigation: true,
        targetUrl: explicitUrl,
        siteName: domainLabel,
      };
    }

    // 2. Comandos compostos com pesquisa subsequente:
    // Ex: "Abre o Google e pesquisa celulares Samsung"
    // Ex: "Vai para o YouTube e busca trailers"
    const combinedSearchMatch = lower.match(
      /(?:abre|abra|abrir|vai|va|vá|acessa|acesse|acessar|entra|entre|entrar|navega|navegue|navegar)\s+(?:para\s+o|para\s+a|para|pro|pra|ao|à|no\s+site\s+do|na\s+página\s+do|no|na|em|o\s+site\s+do|a\s+página\s+do|o|a)?\s*([a-zá-ú0-9_.-]+)\s+e\s+(?:pesquisa|pesquise|pesquisar|busca|busque|buscar|procura|procure|procurar)\s+(?:por\s+|sobre\s+|o\s+|a\s+|os\s+|as\s+)?(.+)/i
    );
    if (combinedSearchMatch) {
      const siteKey = combinedSearchMatch[1].trim();
      const rawQuery = combinedSearchMatch[2].trim();
      const cleanQuery = rawQuery.replace(/^(?:por|sobre|o|a|os|as)\s+/i, '').trim();
      const site = this.KNOWN_SITES[siteKey];

      if (site) {
        let directUrl = site.url;
        if (siteKey.includes('google')) {
          directUrl = `https://www.google.com/search?q=${encodeURIComponent(cleanQuery)}`;
        } else if (siteKey.includes('youtube')) {
          directUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(cleanQuery)}`;
        } else if (siteKey.includes('wiki')) {
          directUrl = `https://pt.wikipedia.org/w/index.php?search=${encodeURIComponent(cleanQuery)}`;
        }

        return {
          isNavigation: true,
          targetUrl: directUrl,
          siteName: site.name,
          hasSubsequentSearch: true,
          searchQuery: cleanQuery,
        };
      } else if (siteKey.includes('.')) {
        return {
          isNavigation: true,
          targetUrl: `https://${siteKey}`,
          siteName: siteKey,
          hasSubsequentSearch: true,
          searchQuery: cleanQuery,
        };
      }
    }

    // 3. Verifica domínio direto no texto (ex: google.com, youtube.com, wikipedia.org, github.com)
    const domainMatch = clean.match(/\b((?:www\.)?[a-zA-Z0-9-]+\.(?:com|org|net|gov|edu|io|br|app|dev|co))\b/i);
    if (domainMatch && !lower.startsWith('qual') && !lower.startsWith('como')) {
      const domain = domainMatch[1];
      const fullUrl = `https://${domain.startsWith('www.') ? domain : domain}`;
      
      // Procura nome amigável se for site conhecido
      const knownKey = Object.keys(this.KNOWN_SITES).find(k => domain.includes(k));
      const friendlyName = knownKey ? this.KNOWN_SITES[knownKey].name : domain;

      return {
        isNavigation: true,
        targetUrl: fullUrl,
        siteName: friendlyName,
      };
    }

    // 4. Comandos com verbos de navegação e sites conhecidos:
    // "Abre o Google", "Vai para o YouTube", "Abre a Wikipédia", "Acessa a Wikipedia", "Abre o YouTube", etc.
    const navVerbRegex = /(?:abre|abra|abrir|abri|vai|va|vá|ir|acessa|acesse|acessar|entra|entre|entrar|navega|navegue|navegar|visita|visite|visitar|carrega|carregar)/i;
    
    if (navVerbRegex.test(lower)) {
      // Procura primeiro pelo nome de site conhecido na frase
      for (const [key, site] of Object.entries(this.KNOWN_SITES)) {
        const sitePattern = new RegExp(`\\b${key}\\b`, 'i');
        if (sitePattern.test(lower)) {
          return {
            isNavigation: true,
            targetUrl: site.url,
            siteName: site.name,
          };
        }
      }
    }

    // 5. Palavra única correspondente a um site conhecido (ex: "Google", "YouTube", "Wikipédia")
    if (this.KNOWN_SITES[lower]) {
      return {
        isNavigation: true,
        targetUrl: this.KNOWN_SITES[lower].url,
        siteName: this.KNOWN_SITES[lower].name,
      };
    }

    // 6. Comandos diretos de busca ou pesquisa na web (ex: "pesquisa por celulares", "procura por algo", "por sandro curio")
    const generalSearchMatch = lower.match(
      /^(?:pesquisa|pesquise|pesquisar|busca|busque|buscar|procura|procure|procurar|por|sobre)\s+(?:por\s+|sobre\s+|o\s+|a\s+|os\s+|as\s+)?(.+)/i
    );
    if (generalSearchMatch) {
      const q = generalSearchMatch[1].trim();
      if (q && q.length > 1 && !this.KNOWN_SITES[q] && !lower.startsWith('qual') && !lower.startsWith('como')) {
        return {
          isNavigation: true,
          targetUrl: `https://www.google.com/search?q=${encodeURIComponent(q)}`,
          siteName: `Google: ${q}`,
          hasSubsequentSearch: false,
          searchQuery: q,
        };
      }
    }

    return { isNavigation: false };
  }
}
