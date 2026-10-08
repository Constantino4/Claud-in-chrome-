export interface PageElement {
  id: string; // e.g. "BUTTON_01", "INPUT_02", "LINK_05", "SELECT_01", "TEXTAREA_01"
  tagName: string;
  type?: string;
  text: string;
  selector?: string;
  href?: string;
  placeholder?: string;
  value?: string;
  disabled?: boolean;
  isSensitive?: boolean;
  category: 'button' | 'link' | 'input' | 'textarea' | 'select' | 'form' | 'product' | 'heading' | 'text' | 'table' | 'image';
  attributes?: Record<string, string>;
  bounds?: { x: number; y: number; width: number; height: number };
}

export interface VisionElement {
  id: string; // e.g. "element-1", "element-2"
  type: 'button' | 'input' | 'link' | 'menu' | 'textarea' | 'select' | 'image' | 'text' | 'form';
  text: string;
  placeholder?: string;
  ariaLabel?: string;
  role?: string;
  href?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  disabled: boolean;
  tagName?: string;
  name?: string;
  selector?: string;
}

export interface VisionSnapshot {
  page: {
    url: string;
    title: string;
  };
  elements: VisionElement[];
  visibleText: string;
  headings: string[];
  screenshotAvailable: boolean;
  screenshotBase64?: string;
  timestamp: number;
}

export interface ProductItem {
  id: string;
  name: string;
  price: string;
  numericPrice: number;
  rating?: number;
  specs?: string[];
  imageUrl?: string;
  buyElementId?: string;
}

export interface PageSnapshot {
  url: string;
  title: string;
  headings: string[];
  mainTextSnippet: string;
  elements: PageElement[];
  products: ProductItem[];
  images?: { id: string; alt: string; src: string }[];
  forms: {
    id: string;
    action?: string;
    fields: { id: string; name: string; label: string; type: string; value?: string }[];
  }[];
  structuredText?: string;
  timestamp: number;
}

export interface BrowserTab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  history: string[];
  historyIndex: number;
  isLoading: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  zoom: number;
  snapshot?: PageSnapshot;
}

export interface AgentStepLog {
  id: string;
  timestamp: number;
  icon: string;
  text: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'requires_confirmation';
  detail?: string;
}

export interface AgentAction {
  tool: string;
  params: Record<string, any>;
  reasoning: string;
}

export interface WebSearchResultItem {
  title: string;
  url: string;
  snippet: string;
  source?: string;
}

export interface TaskPlanStep {
  id: string;
  stepNumber: number;
  title: string;
  tool: 'web_search' | 'browser_agent' | 'browser_vision' | 'browser_action' | 'verification' | 'synthesis';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  actionDescription?: string;
  observation?: string;
}

export interface TaskPlan {
  objective: string;
  totalSteps: number;
  steps: TaskPlanStep[];
  currentStepIndex: number;
}

export interface ExtractedProduct {
  id: string;
  model: string;
  brand: string;
  priceFormatted: string;
  priceNumeric: number;
  currency: string;
  specs: string;
  store: string;
  url: string;
  available: boolean;
  highlight?: string;
}

export interface AgentDecision {
  type: 'autonomous_plan' | 'web_search' | 'browser_agent' | 'direct_answer';
  targetQuery?: string;
  targetUrl?: string;
  targetAction?: string;
  reasoning?: string;
  objective?: string;
}

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  decision?: AgentDecision;
  plan?: TaskPlan;
  searchResults?: WebSearchResultItem[];
  searchQuery?: string;
  browserAgentPlan?: {
    targetUrl?: string;
    targetAction?: string;
    plannedSteps: string[];
    statusNote: string;
  };
  extractedProducts?: ExtractedProduct[];
  actionsTaken?: AgentStepLog[];
  comparisonTable?: {
    headers: string[];
    rows: (string | number)[][];
  };
  verificationLogs?: {
    step: string;
    check: string;
    passed: boolean;
    detail: string;
  }[];
  suggestedFollowUps?: string[];
  error?: string;
  requiresConfirmation?: SensitiveConfirmation;
}

export interface SensitiveConfirmation {
  id: string;
  title: string;
  description: string;
  actionType: 'purchase' | 'payment' | 'submit_form' | 'login' | 'delete_data' | 'reservation' | 'post_content';
  targetElementId?: string;
  payload?: any;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export type AgentTaskStatus =
  | 'PLANNING'
  | 'OBSERVING'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'COMPLETED'
  | 'FAILED'
  | 'STOPPED'
  | 'WAITING_FOR_CONFIRMATION';

export interface TaskMemoryState {
  id: string;
  objective: string;
  createdAt: number;
  status: AgentTaskStatus;
  currentStepIndex: number;
  findings: {
    products?: ProductItem[];
    extractedData?: Record<string, any>;
    summary?: string;
    notes?: string[];
  };
  navigationTrail: string[];
}

export interface HistoryItem {
  id: string;
  url: string;
  title: string;
  timestamp: number;
  visitedCount: number;
}

export interface BookmarkItem {
  id: string;
  url: string;
  title: string;
  icon?: string;
  createdAt: number;
  category?: string;
}

export interface ConversationSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: AgentMessage[];
  stepLogs: AgentStepLog[];
}

