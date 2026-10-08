import { HistoryItem, BookmarkItem } from '../types/browser';

export interface AppSettings {
  theme: 'dark' | 'light';
  searchEngine: 'morph' | 'duckduckgo' | 'google';
  requireConfirmation: boolean;
  voiceReadback: boolean;
  showDeviceFrame: boolean;
  agentSpeed: 'normal' | 'fast';
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  searchEngine: 'morph',
  requireConfirmation: true,
  voiceReadback: false,
  showDeviceFrame: false,
  agentSpeed: 'normal',
};

const DEFAULT_BOOKMARKS: BookmarkItem[] = [
  { id: 'bm_1', title: 'Morph Search', url: 'morph://search', icon: '🔍', createdAt: Date.now() },
  { id: 'bm_2', title: 'TechShop Mobile', url: 'morph://techshop', icon: '📱', createdAt: Date.now() },
  { id: 'bm_3', title: 'Suporte & Contato', url: 'morph://contact', icon: '📝', createdAt: Date.now() },
  { id: 'bm_4', title: 'WikiMorph Artigo', url: 'morph://wiki', icon: '📚', createdAt: Date.now() },
];

export class SettingsManager {
  private settings: AppSettings = DEFAULT_SETTINGS;
  private history: HistoryItem[] = [];
  private bookmarks: BookmarkItem[] = DEFAULT_BOOKMARKS;
  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...partial };
    this.saveToStorage();
    this.notify();
  }

  public getHistory(): HistoryItem[] {
    return [...this.history];
  }

  public addHistoryItem(url: string, title: string): void {
    const existing = this.history.find((h) => h.url === url);
    if (existing) {
      existing.timestamp = Date.now();
      existing.visitedCount += 1;
      existing.title = title || existing.title;
    } else {
      this.history.unshift({
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
        url,
        title: title || url,
        timestamp: Date.now(),
        visitedCount: 1,
      });
      if (this.history.length > 50) this.history.pop();
    }
    this.saveToStorage();
    this.notify();
  }

  public clearHistory(): void {
    this.history = [];
    this.saveToStorage();
    this.notify();
  }

  public getBookmarks(): BookmarkItem[] {
    return [...this.bookmarks];
  }

  public toggleBookmark(url: string, title: string): boolean {
    const idx = this.bookmarks.findIndex((b) => b.url === url);
    if (idx >= 0) {
      this.bookmarks.splice(idx, 1);
      this.saveToStorage();
      this.notify();
      return false; // removed
    } else {
      this.bookmarks.push({
        id: `bm_${Date.now()}`,
        url,
        title: title || url,
        icon: '⭐',
        createdAt: Date.now(),
      });
      this.saveToStorage();
      this.notify();
      return true; // added
    }
  }

  public isBookmarked(url: string): boolean {
    return this.bookmarks.some((b) => b.url === url);
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      const savedSettings = localStorage.getItem('morph_settings');
      if (savedSettings) this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };

      const savedHistory = localStorage.getItem('morph_history');
      if (savedHistory) this.history = JSON.parse(savedHistory);

      const savedBookmarks = localStorage.getItem('morph_bookmarks');
      if (savedBookmarks) this.bookmarks = JSON.parse(savedBookmarks);
    } catch (e) {
      console.warn('Erro ao carregar dados do LocalStorage:', e);
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('morph_settings', JSON.stringify(this.settings));
      localStorage.setItem('morph_history', JSON.stringify(this.history));
      localStorage.setItem('morph_bookmarks', JSON.stringify(this.bookmarks));
    } catch (e) {
      console.warn('Erro ao salvar no LocalStorage:', e);
    }
  }
}

export const settingsManager = new SettingsManager();
