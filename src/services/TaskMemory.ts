import { TaskMemoryState, ProductItem } from '../types/browser';

export class TaskMemory {
  private state: TaskMemoryState;

  constructor() {
    this.state = this.createEmptyState('');
  }

  public initNewTask(objective: string): TaskMemoryState {
    this.state = this.createEmptyState(objective);
    return this.state;
  }

  public getState(): TaskMemoryState {
    return { ...this.state };
  }

  public updateStepIndex(): void {
    this.state.currentStepIndex += 1;
  }

  public addNavTrail(url: string): void {
    if (!this.state.navigationTrail.includes(url)) {
      this.state.navigationTrail.push(url);
    }
  }

  public addProduct(product: ProductItem): void {
    if (!this.state.findings.products) {
      this.state.findings.products = [];
    }
    const exists = this.state.findings.products.some((p) => p.name.toLowerCase() === product.name.toLowerCase());
    if (!exists) {
      this.state.findings.products.push(product);
    }
  }

  public addProducts(products: ProductItem[]): void {
    products.forEach((p) => this.addProduct(p));
  }

  public setSummary(summary: string): void {
    this.state.findings.summary = summary;
  }

  public addNote(note: string): void {
    if (!this.state.findings.notes) {
      this.state.findings.notes = [];
    }
    this.state.findings.notes.push(note);
  }

  public setExtractedData(key: string, value: any): void {
    if (!this.state.findings.extractedData) {
      this.state.findings.extractedData = {};
    }
    this.state.findings.extractedData[key] = value;
  }

  public completeTask(): void {
    this.state.status = 'COMPLETED';
  }

  public cancelTask(): void {
    this.state.status = 'STOPPED';
  }

  public reset(): void {
    this.state = this.createEmptyState('');
  }

  private createEmptyState(objective: string): TaskMemoryState {
    return {
      id: `TASK_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      objective,
      createdAt: Date.now(),
      status: 'PLANNING',
      currentStepIndex: 0,
      findings: {
        products: [],
        extractedData: {},
        summary: '',
        notes: [],
      },
      navigationTrail: [],
    };
  }
}

export const taskMemory = new TaskMemory();
