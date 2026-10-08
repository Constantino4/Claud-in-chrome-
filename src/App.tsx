import React, { useState, useEffect, useRef } from 'react';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { ChatMainView } from './components/ChatMainView';
import { AppSidebar } from './components/AppSidebar';
import { BrowserViewerModal } from './components/BrowserViewerModal';
import { BrowserEngine } from './components/BrowserEngine';
import { ConfirmationModal } from './components/ConfirmationModal';
import { TabsSwitcherModal } from './components/TabsSwitcherModal';
import { BookmarksHistoryModal } from './components/BookmarksHistoryModal';
import { PrivacyModal } from './components/PrivacyModal';
import { SettingsModal } from './components/SettingsModal';
import { BrowserVisionModal } from './components/BrowserVisionModal';

import { tabManager } from './services/TabManager';
import { agentController } from './services/AgentController';
import { confirmationManager } from './services/ConfirmationManager';
import { settingsManager } from './services/SettingsManager';
import { conversationManager } from './services/ConversationManager';
import { actionExecutor } from './services/ActionExecutor';
import { browserController } from './services/BrowserController';
import {
  BrowserTab,
  PageSnapshot,
  SensitiveConfirmation,
  AgentMessage,
  AgentStepLog,
  ConversationSession,
} from './types/browser';

export default function App() {
  // Estado das Abas do Navegador
  const [tabs, setTabs] = useState<BrowserTab[]>(tabManager.getTabs());
  const [activeTabId, setActiveTabId] = useState<string>(tabManager.getActiveTabId());

  // Estado das Sessões de Conversa (ChatGPT-Style)
  const [conversations, setConversations] = useState<ConversationSession[]>(
    conversationManager.getConversations()
  );
  const [activeConversationId, setActiveConversationId] = useState<string>(
    conversationManager.getActiveId()
  );

  // Estado das Mensagens do Agente
  const [messages, setMessages] = useState<AgentMessage[]>(agentController.getMessages());
  const [stepLogs, setStepLogs] = useState<AgentStepLog[]>(agentController.getStepLogs());
  const [isAiRunning, setIsAiRunning] = useState<boolean>(agentController.getIsRunning());
  const [lastError, setLastError] = useState<{ goal: string } | null>(agentController.getLastError());

  // Confirmação de Segurança
  const [activeConfirmation, setActiveConfirmation] = useState<SensitiveConfirmation | null>(
    confirmationManager.getActiveConfirmation()
  );

  // Configurações e Preferências
  const [settings, setSettings] = useState(settingsManager.getSettings());
  const [history, setHistory] = useState(settingsManager.getHistory());
  const [bookmarks, setBookmarks] = useState(settingsManager.getBookmarks());

  // Controle de Navegação e Visibilidade da Interface
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBrowserOpen, setIsBrowserOpen] = useState(false);

  // Modais Secundários
  const [isTabsModalOpen, setIsTabsModalOpen] = useState(false);
  const [isBookmarksHistoryOpen, setIsBookmarksHistoryOpen] = useState(false);
  const [bookmarksHistoryInitialTab, setBookmarksHistoryInitialTab] = useState<'bookmarks' | 'history'>('bookmarks');
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);

  const engineHandlerRef = useRef<any>(null);

  // Subscrições aos Serviços Reativos
  useEffect(() => {
    const unsubTabs = tabManager.subscribe((newTabs, newActiveId) => {
      setTabs(newTabs);
      setActiveTabId(newActiveId);
    });

    const unsubAgent = agentController.subscribe(() => {
      const msgs = agentController.getMessages();
      const logs = agentController.getStepLogs();
      setMessages(msgs);
      setStepLogs(logs);
      setIsAiRunning(agentController.getIsRunning());
      setLastError(agentController.getLastError());

      // Sincroniza com a conversa ativa
      conversationManager.updateActiveMessages(msgs, logs);
    });

    const unsubConv = conversationManager.subscribe(() => {
      setConversations(conversationManager.getConversations());
      setActiveConversationId(conversationManager.getActiveId());
    });

    const unsubConfirm = confirmationManager.subscribe((confirm) => {
      setActiveConfirmation(confirm);
    });

    const unsubSettings = settingsManager.subscribe(() => {
      setSettings(settingsManager.getSettings());
      setHistory(settingsManager.getHistory());
      setBookmarks(settingsManager.getBookmarks());
    });

    const unsubBrowserOpen = browserController.onOpenBrowserView(() => {
      setIsBrowserOpen(true);
    });

    const unsubBrowserClose = browserController.onCloseBrowserView(() => {
      setIsBrowserOpen(false);
    });

    return () => {
      unsubTabs();
      unsubAgent();
      unsubConv();
      unsubConfirm();
      unsubSettings();
      unsubBrowserOpen();
      unsubBrowserClose();
    };
  }, []);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];
  const isBookmarked = activeTab ? settingsManager.isBookmarked(activeTab.url) : false;

  // Registra os handlers do DOM no ActionExecutor, BrowserController e no AgentController
  const handleRegisterEngineHandler = (handler: any) => {
    engineHandlerRef.current = handler;
    actionExecutor.setBrowserEngineHandler(handler);
    browserController.setBrowserEngineHandler(handler);

    agentController.registerProviders(
      () => handler.getSnapshot(),
      () => handler.getContainer()
    );
  };

  // Navegação do Navegador
  const handleNavigate = (url: string) => {
    tabManager.updateActiveTabUrl(url);
    settingsManager.addHistoryItem(url, activeTab?.title || url);
  };

  const handleUpdateSnapshot = (snapshot: PageSnapshot) => {
    tabManager.updateActiveTabSnapshot(snapshot);
    if (snapshot.title && activeTab) {
      settingsManager.addHistoryItem(activeTab.url, snapshot.title);
    }
  };

  // Envio de Comando do Usuário para o Agente
  const handleSubmitAgentGoal = (goal: string) => {
    agentController.submitUserGoal(goal);
  };

  // Gerenciamento de Conversas
  const handleNewConversation = () => {
    agentController.clearHistory();
    conversationManager.createNewConversation('Nova conversa');
    setMessages([]);
    setStepLogs([]);
  };

  const handleSelectConversation = (id: string) => {
    conversationManager.selectConversation(id);
    const conv = conversationManager.getActiveConversation();
    if (conv) {
      setMessages(conv.messages);
      setStepLogs(conv.stepLogs);
    }
  };

  const handleDeleteConversation = (id: string) => {
    conversationManager.deleteConversation(id);
  };

  const handleToggleBookmark = () => {
    if (activeTab) {
      settingsManager.toggleBookmark(activeTab.url, activeTab.title);
    }
  };

  return (
    <div className={`w-screen h-screen flex flex-col items-center justify-center overflow-hidden font-sans select-none ${
      settings.theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Container Principal: Responsivo para celular ou viewport moderno */}
      <div className="w-full h-full flex flex-col relative overflow-hidden bg-slate-950">
        {/* Barra de Status do Android */}
        <AndroidStatusBar />

        {/* 1. TELA PRINCIPAL DE CHAT DE IA (Interface central e prioritária) */}
        <ChatMainView
          messages={messages}
          stepLogs={stepLogs}
          isRunning={isAiRunning}
          lastError={lastError}
          currentSnapshot={activeTab?.snapshot}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenBrowser={() => setIsBrowserOpen(true)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenVision={() => setIsVisionModalOpen(true)}
          onSubmitGoal={handleSubmitAgentGoal}
          onStop={() => agentController.stop()}
          onRetry={() => agentController.retryLastFailed()}
          onClearChat={handleNewConversation}
          theme={settings.theme}
        />

        {/* 2. BARRA LATERAL (Drawer de Navegação de Conversas & Ajustes) */}
        <AppSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          conversations={conversations}
          activeId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          onOpenBrowser={() => setIsBrowserOpen(true)}
          onOpenHistory={() => {
            setBookmarksHistoryInitialTab('history');
            setIsBookmarksHistoryOpen(true);
          }}
          onOpenBookmarks={() => {
            setBookmarksHistoryInitialTab('bookmarks');
            setIsBookmarksHistoryOpen(true);
          }}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
        />

        {/* 3. NAVEGADOR WEB EM MODAL / SLIDE-IN ("Ver navegador" com "← Voltar ao chat") */}
        <BrowserViewerModal
          isOpen={isBrowserOpen}
          onClose={() => setIsBrowserOpen(false)}
          currentTab={activeTab}
          tabsCount={tabs.length}
          isBookmarked={isBookmarked}
          isAgentRunning={isAiRunning}
          onNavigate={handleNavigate}
          onGoBack={() => tabManager.goBack()}
          onGoForward={() => tabManager.goForward()}
          onReload={() => {
            tabManager.setLoading(true);
            setTimeout(() => tabManager.setLoading(false), 400);
          }}
          onOpenTabs={() => setIsTabsModalOpen(true)}
          onToggleBookmark={handleToggleBookmark}
          onOpenVision={() => setIsVisionModalOpen(true)}
        >
          {/* O BrowserEngine permanece montado e interativo */}
          <BrowserEngine
            currentTab={activeTab}
            onNavigate={handleNavigate}
            onUpdateSnapshot={handleUpdateSnapshot}
            onRegisterEngineHandler={handleRegisterEngineHandler}
          />
        </BrowserViewerModal>

        {/* 4. MODAL DE VISÃO DO NAVEGADOR (Browser Vision - Olhos da IA) */}
        <BrowserVisionModal
          isOpen={isVisionModalOpen}
          onClose={() => setIsVisionModalOpen(false)}
          domContainer={engineHandlerRef.current?.getContainer()}
        />

        {/* 4. MODAL DE CONFIRMAÇÃO DE AÇÕES SENSÍVEIS (Compras, Pagamentos, Formulários) */}
        <ConfirmationModal
          confirmation={activeConfirmation}
          onConfirm={() => confirmationManager.resolveActive(true)}
          onCancel={() => confirmationManager.resolveActive(false)}
        />

        {/* 5. MODAL DE GERENCIAMENTO DE ABAS */}
        <TabsSwitcherModal
          isOpen={isTabsModalOpen}
          onClose={() => setIsTabsModalOpen(false)}
          tabs={tabs}
          activeTabId={activeTabId}
          onSwitchTab={(id) => tabManager.switchTab(id)}
          onCloseTab={(id) => tabManager.closeTab(id)}
          onNewTab={() => {
            tabManager.createTab('morph://home', 'Morph Início');
            setIsTabsModalOpen(false);
          }}
          onRestoreClosed={() => tabManager.restoreRecentlyClosedTab()}
          recentlyClosedCount={tabManager.getRecentlyClosedCount()}
        />

        {/* 6. MODAL DE FAVORITOS E HISTÓRICO */}
        <BookmarksHistoryModal
          isOpen={isBookmarksHistoryOpen}
          onClose={() => setIsBookmarksHistoryOpen(false)}
          initialTab={bookmarksHistoryInitialTab}
          bookmarks={bookmarks}
          history={history}
          onNavigate={(url) => {
            handleNavigate(url);
            setIsBrowserOpen(true);
          }}
          onClearHistory={() => settingsManager.clearHistory()}
          onRemoveBookmark={(url) => settingsManager.toggleBookmark(url, '')}
        />

        {/* 7. MODAL DE POLÍTICA DE PRIVACIDADE E DADOS */}
        <PrivacyModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
          onClearAllData={() => {
            settingsManager.clearHistory();
            agentController.clearHistory();
            conversationManager.createNewConversation('Nova conversa');
            alert('Todos os dados de navegação e histórico do Morph foram apagados.');
          }}
        />

        {/* 8. MODAL DE CONFIGURAÇÕES */}
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          settings={settings}
          onUpdateSettings={(partial) => settingsManager.updateSettings(partial)}
          onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
        />
      </div>
    </div>
  );
}
