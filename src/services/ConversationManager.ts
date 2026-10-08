import { ConversationSession, AgentMessage, AgentStepLog } from '../types/browser';

const STORAGE_KEY = 'morph_conversations';
const ACTIVE_CONV_KEY = 'morph_active_conv_id';

const INITIAL_CONVERSATION: ConversationSession = {
  id: 'conv_default',
  title: 'Nova conversa',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  messages: [],
  stepLogs: [],
};

const SAMPLE_RECENT_CONVERSATIONS: ConversationSession[] = [
  {
    id: 'conv_sample_1',
    title: 'Pesquisa de smartphones baratos',
    createdAt: Date.now() - 3600000 * 2, // Hoje
    updatedAt: Date.now() - 3600000 * 2,
    messages: [
      {
        id: 'msg_1',
        role: 'user',
        content: 'Procura smartphones baratos e compara os preços.',
        timestamp: Date.now() - 3600000 * 2,
      },
      {
        id: 'msg_2',
        role: 'assistant',
        content: 'Encontrei 4 celulares no catálogo TechShop. O mais barato é o **Realme Note 50** por **R$ 689,00**.',
        timestamp: Date.now() - 3600000 * 2 + 1000,
        comparisonTable: {
          headers: ['Modelo', 'Preço', 'Destaque'],
          rows: [
            ['Realme Note 50', 'R$ 689,00', 'Menor Preço'],
            ['Xiaomi Redmi 13C', 'R$ 749,00', 'Mais Vendido'],
            ['Galaxy A15', 'R$ 799,00', 'Super AMOLED'],
          ],
        },
      },
    ],
    stepLogs: [
      { id: '1', timestamp: Date.now(), icon: '✓', text: 'Pesquisa na web concluída', status: 'completed' },
      { id: '2', timestamp: Date.now(), icon: '✓', text: 'Preços comparados com sucesso', status: 'completed' },
    ],
  },
  {
    id: 'conv_sample_2',
    title: 'Resumo sobre Agentes de IA',
    createdAt: Date.now() - 86400000, // Ontem
    updatedAt: Date.now() - 86400000,
    messages: [
      {
        id: 'msg_3',
        role: 'user',
        content: 'Resume a página sobre navegadores com agente de IA.',
        timestamp: Date.now() - 86400000,
      },
      {
        id: 'msg_4',
        role: 'assistant',
        content: 'O artigo explica que os navegadores modernos com IA passam de simples renderizadores de HTML para executores autônomos orientados a objetivos com pontes JavaScript seguras.',
        timestamp: Date.now() - 86400000 + 1000,
      },
    ],
    stepLogs: [
      { id: '3', timestamp: Date.now(), icon: '✓', text: 'Página analisada e resumida', status: 'completed' },
    ],
  },
];

export class ConversationManager {
  private conversations: ConversationSession[] = [];
  private activeId: string = 'conv_default';
  private listeners: (() => void)[] = [];

  constructor() {
    this.load();
  }

  public getConversations(): ConversationSession[] {
    return [...this.conversations];
  }

  public getActiveConversation(): ConversationSession {
    const found = this.conversations.find((c) => c.id === this.activeId);
    if (found) return found;
    return this.conversations[0] || INITIAL_CONVERSATION;
  }

  public getActiveId(): string {
    return this.activeId;
  }

  public createNewConversation(initialTitle: string = 'Nova conversa'): ConversationSession {
    const newConv: ConversationSession = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: initialTitle,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      stepLogs: [],
    };
    this.conversations.unshift(newConv);
    this.activeId = newConv.id;
    this.save();
    this.notify();
    return newConv;
  }

  public selectConversation(id: string): void {
    if (this.conversations.some((c) => c.id === id)) {
      this.activeId = id;
      this.save();
      this.notify();
    }
  }

  public deleteConversation(id: string): void {
    this.conversations = this.conversations.filter((c) => c.id !== id);
    if (this.conversations.length === 0) {
      this.createNewConversation('Nova conversa');
    } else if (this.activeId === id) {
      this.activeId = this.conversations[0].id;
    }
    this.save();
    this.notify();
  }

  public updateActiveMessages(messages: AgentMessage[], stepLogs: AgentStepLog[]): void {
    const conv = this.conversations.find((c) => c.id === this.activeId);
    if (conv) {
      conv.messages = messages;
      conv.stepLogs = stepLogs;
      conv.updatedAt = Date.now();

      // Define título automático a partir da primeira mensagem do usuário se ainda for padrão
      if (conv.title === 'Nova conversa' && messages.length > 0) {
        const firstUser = messages.find((m) => m.role === 'user');
        if (firstUser) {
          conv.title = firstUser.content.slice(0, 32) + (firstUser.content.length > 32 ? '...' : '');
        }
      }

      this.save();
      this.notify();
    }
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

  private load(): void {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        this.conversations = JSON.parse(saved);
      } else {
        this.conversations = [INITIAL_CONVERSATION, ...SAMPLE_RECENT_CONVERSATIONS];
      }

      const savedActive = localStorage.getItem(ACTIVE_CONV_KEY);
      if (savedActive && this.conversations.some((c) => c.id === savedActive)) {
        this.activeId = savedActive;
      } else if (this.conversations.length > 0) {
        this.activeId = this.conversations[0].id;
      }
    } catch (e) {
      console.warn('Erro ao carregar conversas do LocalStorage:', e);
      this.conversations = [INITIAL_CONVERSATION];
    }
  }

  private save(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.conversations));
      localStorage.setItem(ACTIVE_CONV_KEY, this.activeId);
    } catch (e) {
      console.warn('Erro ao salvar conversas no LocalStorage:', e);
    }
  }
}

export const conversationManager = new ConversationManager();
