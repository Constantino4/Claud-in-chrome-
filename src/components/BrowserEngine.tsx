import React, { useRef, useEffect, useState, useCallback } from 'react';
import { BrowserTab, PageSnapshot } from '../types/browser';
import { PageAnalyzer } from '../services/PageAnalyzer';
import { browserVision } from '../services/BrowserVision';
import { tabManager } from '../services/TabManager';
import { MorphSearchPage } from './pages/MorphSearchPage';
import { TechShopPage } from './pages/TechShopPage';
import { ContactFormPage } from './pages/ContactFormPage';
import { WikiPage } from './pages/WikiPage';
import { BookingPage } from './pages/BookingPage';
import { WebProxyPage } from './pages/WebProxyPage';
import { GoogleWebPage } from './pages/GoogleWebPage';
import { YouTubeWebPage } from './pages/YouTubeWebPage';
import { BetwayPortalPage } from './pages/BetwayPortalPage';

interface BrowserEngineProps {
  currentTab?: BrowserTab;
  onNavigate: (url: string) => void;
  onUpdateSnapshot: (snapshot: PageSnapshot) => void;
  onRegisterEngineHandler: (handler: any) => void;
}

export const BrowserEngine: React.FC<BrowserEngineProps> = ({
  currentTab,
  onNavigate,
  onUpdateSnapshot,
  onRegisterEngineHandler,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSnapshot, setCurrentSnapshot] = useState<PageSnapshot | null>(null);

  // Analisa o DOM da página atual e gera o snapshot para a IA
  const extractSnapshot = useCallback((): PageSnapshot => {
    if (!containerRef.current || !currentTab) {
      return {
        url: currentTab?.url || 'morph://home',
        title: currentTab?.title || 'Morph Início',
        headings: [],
        mainTextSnippet: '',
        elements: [],
        products: [],
        forms: [],
        timestamp: Date.now(),
      };
    }

    // 1. Executa o BrowserVision no DOM para identificar element-1, element-2... com posições
    browserVision.captureDOM(
      containerRef.current,
      currentTab.url,
      currentTab.title || 'Morph Browser'
    );

    // 2. Mantém snapshot do PageAnalyzer para compatibilidade
    const snapshot = PageAnalyzer.analyzeDOM(
      containerRef.current,
      currentTab.url,
      currentTab.title || 'Morph Browser'
    );
    setCurrentSnapshot(snapshot);
    onUpdateSnapshot(snapshot);
    return snapshot;
  }, [currentTab, onUpdateSnapshot]);

  // Atualiza o snapshot sempre que a URL ou página muda
  useEffect(() => {
    const timer = setTimeout(() => {
      extractSnapshot();
    }, 250);
    return () => clearTimeout(timer);
  }, [currentTab?.url, extractSnapshot]);

  // Registra as funções da ponte do navegador no ActionExecutor
  useEffect(() => {
    onRegisterEngineHandler({
      navigateTo: (url: string) => onNavigate(url),
      goBack: () => tabManager.goBack(),
      goForward: () => tabManager.goForward(),
      reload: () => {
        tabManager.setLoading(true);
        setTimeout(() => tabManager.setLoading(false), 400);
      },
      getSnapshot: () => extractSnapshot(),
      getCurrentUrl: () => currentTab?.url || '',
      getCurrentTitle: () => currentTab?.title || '',
      getContainer: () => containerRef.current,
      getVisionSnapshot: () => browserVision.getLastSnapshot(),
      captureVision: (includeScreenshot = true) => {
        if (!containerRef.current || !currentTab) return null;
        return browserVision.captureFullVision(
          containerRef.current,
          currentTab.url,
          currentTab.title || 'Morph Browser',
          includeScreenshot
        );
      },
      handleSimulatedClick: (elementId: string) => {
        if (!containerRef.current) return false;
        const node = containerRef.current.querySelector(
          `[data-vision-id="${elementId}"], [data-morph-id="${elementId}"]`
        ) as HTMLElement;
        if (node) {
          node.click();
          return true;
        }
        return false;
      },
      handleSimulatedType: (elementId: string, text: string) => {
        if (!containerRef.current) return false;
        const node = containerRef.current.querySelector(
          `[data-vision-id="${elementId}"], [data-morph-id="${elementId}"]`
        ) as HTMLInputElement;
        if (node) {
          node.value = text;
          node.dispatchEvent(new Event('input', { bubbles: true }));
          node.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
        return false;
      },
    });
  }, [currentTab, onNavigate, extractSnapshot, onRegisterEngineHandler]);

  const renderActivePage = () => {
    const url = currentTab?.url || 'morph://home';

    if (url.startsWith('morph://home') || url.startsWith('morph://search')) {
      const searchParams = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
      const initialQuery = searchParams.get('q') || '';
      return <MorphSearchPage onNavigate={onNavigate} initialQuery={initialQuery} />;
    }

    if (url.startsWith('morph://techshop')) {
      return <TechShopPage onBack={() => onNavigate('morph://search')} />;
    }

    if (url.startsWith('morph://contact')) {
      return <ContactFormPage onBack={() => onNavigate('morph://search')} />;
    }

    if (url.startsWith('morph://wiki')) {
      return <WikiPage onBack={() => onNavigate('morph://search')} onNavigate={onNavigate} />;
    }

    if (url.startsWith('morph://booking')) {
      return <BookingPage onBack={() => onNavigate('morph://search')} />;
    }

    // Plataforma Betway - Portal oficial integrado de alta performance sem bloqueios regionais
    if (url.includes('betway') || url.startsWith('morph://betway')) {
      return <BetwayPortalPage onBack={() => onNavigate('morph://search')} onNavigate={onNavigate} />;
    }

    // Todos os sites web reais (Google, YouTube, Wikipédia, etc.) rodam de verdade via WebProxyPage
    if (/^https?:\/\//i.test(url)) {
      return <WebProxyPage url={url} onNavigate={onNavigate} />;
    }

    // Fallback padrão: Morph Search
    return <MorphSearchPage onNavigate={onNavigate} />;
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden relative bg-slate-900 focus:outline-none"
    >
      {renderActivePage()}
    </div>
  );
};
