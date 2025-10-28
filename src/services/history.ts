import type { Canvas as FabricCanvas } from 'fabric';

type Listener = () => void;

interface HistoryEntry {
  json: any;
  description?: string;
}

export class FabricHistoryManager {
  private canvas: FabricCanvas | null = null;
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private listeners: Set<Listener> = new Set();

  setCanvas(canvas: FabricCanvas | null) {
    this.canvas = canvas;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  canUndo() {
    return this.undoStack.length > 0;
  }
  canRedo() {
    return this.redoStack.length > 0;
  }

  pushSnapshot(description?: string) {
    if (!this.canvas) return;
    const json = this.canvas.toJSON();
    this.undoStack.push({ json, description });
    this.redoStack = [];
    this.notify();
  }

  undo() {
    if (!this.canvas || this.undoStack.length === 0) return;
    // Current state becomes a redo candidate
    const current = this.canvas.toJSON();
    this.redoStack.push({ json: current });
    // Load last undo state
    const prev = this.undoStack.pop()!;
    this.canvas.loadFromJSON(prev.json, () => {
      this.canvas!.renderAll();
      this.notify();
    });
  }

  redo() {
    if (!this.canvas || this.redoStack.length === 0) return;
    const current = this.canvas.toJSON();
    this.undoStack.push({ json: current });
    const next = this.redoStack.pop()!;
    this.canvas.loadFromJSON(next.json, () => {
      this.canvas!.renderAll();
      this.notify();
    });
  }
}

export const historyManager = new FabricHistoryManager();

