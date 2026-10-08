import { BrowserTab, PageSnapshot } from '../types/browser';

export class TabManager {
  private tabs: BrowserTab[] = [];
  private activeTabId: string = '';
  private recentlyClosedTabs: BrowserTab[] = [];
  private listeners: ((tabs: BrowserTab[], activeTabId: string) => void)[] = [];

  constructor() {
    // Inicializa com uma aba padrão inicial
    const initialTab: BrowserTab = {
      id: `tab_${Date.now()}`,
      url: 'morph://home',
      title: 'Morph Início',
      history: ['morph://home'],
      historyIndex: 0,
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      zoom: 1,
    };
    this.tabs = [initialTab];
    this.activeTabId = initialTab.id;
  }

  public getTabs(): BrowserTab[] {
    return [...this.tabs];
  }

  public getActiveTab(): BrowserTab | undefined {
    return this.tabs.find((t) => t.id === this.activeTabId) || this.tabs[0];
  }

  public getActiveTabId(): string {
    return this.activeTabId;
  }

  public createTab(url: string = 'morph://home', title: string = 'Nova Guia'): BrowserTab {
    const newTab: BrowserTab = {
      id: `tab_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      url,
      title,
      history: [url],
      historyIndex: 0,
      isLoading: false,
      canGoBack: false,
      canGoForward: false,
      zoom: 1,
    };

    this.tabs.push(newTab);
    this.activeTabId = newTab.id;
    this.notify();
    return newTab;
  }

  public switchTab(tabId: string): void {
    const found = this.tabs.find((t) => t.id === tabId);
    if (found) {
      this.activeTabId = tabId;
      this.notify();
    }
  }

  public closeTab(tabId: string): void {
    const tabIndex = this.tabs.findIndex((t) => t.id === tabId);
    if (tabIndex === -1) return;

    const closedTab = this.tabs[tabIndex];
    this.recentlyClosedTabs.unshift(closedTab);
    if (this.recentlyClosedTabs.length > 10) {
      this.recentlyClosedTabs.pop();
    }

    this.tabs.splice(tabIndex, 1);

    // Se fechou todas, cria uma nova
    if (this.tabs.length === 0) {
      const freshTab = this.createTab('morph://home', 'Morph Início');
      this.activeTabId = freshTab.id;
    } else if (this.activeTabId === tabId) {
      // Se a aba fechada era a ativa, ativa a vizinha
      const nextIndex = Math.min(tabIndex, this.tabs.length - 1);
      this.activeTabId = this.tabs[nextIndex].id;
    }

    this.notify();
  }

  public restoreRecentlyClosedTab(): BrowserTab | null {
    if (this.recentlyClosedTabs.length === 0) return null;
    const tabToRestore = this.recentlyClosedTabs.shift()!;
    this.tabs.push(tabToRestore);
    this.activeTabId = tabToRestore.id;
    this.notify();
    return tabToRestore;
  }

  public getRecentlyClosedCount(): number {
    return this.recentlyClosedTabs.length;
  }

  public setTabTitle(tabId: string, title: string): void {
    const tab = this.tabs.find((t) => t.id === tabId);
    if (tab && title) {
      tab.title = title;
      this.notify();
    }
  }

  public updateActiveTabUrl(url: string, title?: string): void {
    const tab = this.getActiveTab();
    if (!tab) return;

    if (tab.url !== url) {
      // Trunca histórico futuro se navegou a partir do meio
      tab.history = tab.history.slice(0, tab.historyIndex + 1);
      tab.history.push(url);
      tab.historyIndex = tab.history.length - 1;
    }

    tab.url = url;
    if (title) {
      tab.title = title;
    } else {
      tab.title = this.getDefaultTitleForUrl(url);
    }
    tab.canGoBack = tab.historyIndex > 0;
    tab.canGoForward = tab.historyIndex < tab.history.length - 1;
    this.notify();
  }

  public getDefaultTitleForUrl(url: string): string {
    const lower = url.toLowerCase();
    if (lower.includes('google.com')) return 'Google';
    if (lower.includes('youtube.com')) return 'YouTube';
    if (lower.includes('wikipedia.org')) return 'Wikipédia';
    if (lower.startsWith('morph://home')) return 'Morph Início';
    if (lower.startsWith('morph://search')) return 'Pesquisa na Web';
    if (lower.startsWith('morph://techshop')) return 'TechShop Loja';
    if (lower.startsWith('morph://contact')) return 'Central de Contato';
    if (lower.startsWith('morph://booking')) return 'Morph Viagens & Reservas';
    if (lower.startsWith('morph://wiki')) return 'WikiMorph';
    try {
      const parsed = new URL(url);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  public updateActiveTabSnapshot(snapshot: PageSnapshot): void {
    const tab = this.getActiveTab();
    if (!tab) return;
    tab.snapshot = snapshot;
    if (snapshot.title) {
      tab.title = snapshot.title;
    }
    this.notify();
  }

  public goBack(): void {
    const tab = this.getActiveTab();
    if (!tab || tab.historyIndex <= 0) return;

    tab.historyIndex -= 1;
    tab.url = tab.history[tab.historyIndex];
    tab.canGoBack = tab.historyIndex > 0;
    tab.canGoForward = tab.historyIndex < tab.history.length - 1;
    this.notify();
  }

  public goForward(): void {
    const tab = this.getActiveTab();
    if (!tab || tab.historyIndex >= tab.history.length - 1) return;

    tab.historyIndex += 1;
    tab.url = tab.history[tab.historyIndex];
    tab.canGoBack = tab.historyIndex > 0;
    tab.canGoForward = tab.historyIndex < tab.history.length - 1;
    this.notify();
  }

  public setLoading(loading: boolean): void {
    const tab = this.getActiveTab();
    if (tab) {
      tab.isLoading = loading;
      this.notify();
    }
  }

  public subscribe(listener: (tabs: BrowserTab[], activeTabId: string) => void): () => void {
    this.listeners.push(listener);
    listener(this.tabs, this.activeTabId);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener([...this.tabs], this.activeTabId));
  }
}

export const tabManager = new TabManager();
