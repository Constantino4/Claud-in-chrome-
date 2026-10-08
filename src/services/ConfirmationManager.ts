import { SensitiveConfirmation } from '../types/browser';

export type ConfirmationCallback = (confirmed: boolean) => void;

export class ConfirmationManager {
  private activeConfirmation: SensitiveConfirmation | null = null;
  private pendingResolver: ConfirmationCallback | null = null;
  private listeners: ((confirmation: SensitiveConfirmation | null) => void)[] = [];

  public requestConfirmation(
    confirmation: Omit<SensitiveConfirmation, 'id' | 'status'>
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const fullConfirmation: SensitiveConfirmation = {
        ...confirmation,
        id: `CONFIRM_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        status: 'pending',
      };

      this.activeConfirmation = fullConfirmation;
      this.pendingResolver = resolve;
      this.notifyListeners();
    });
  }

  public resolveActive(confirmed: boolean): void {
    if (this.pendingResolver) {
      this.pendingResolver(confirmed);
      this.pendingResolver = null;
    }
    if (this.activeConfirmation) {
      this.activeConfirmation.status = confirmed ? 'confirmed' : 'cancelled';
    }
    this.activeConfirmation = null;
    this.notifyListeners();
  }

  public getActiveConfirmation(): SensitiveConfirmation | null {
    return this.activeConfirmation;
  }

  public subscribe(listener: (confirmation: SensitiveConfirmation | null) => void): () => void {
    this.listeners.push(listener);
    listener(this.activeConfirmation);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.activeConfirmation));
  }
}

export const confirmationManager = new ConfirmationManager();
