/**
 * Canvas Drag & Drop Service
 * Handles drag and drop functionality for canvas elements
 */

type DropHandler = (event: DragEvent) => void;

export class CanvasDragDropService {
  private handlers: Map<string, DropHandler> = new Map();
  private canvas: HTMLElement | null = null;

  /**
   * Initialize the service with a canvas element
   */
  init(canvas: HTMLElement): void {
    this.canvas = canvas;
  }

  /**
   * Register an event handler
   */
  on(eventName: string, handler: DropHandler): void {
    this.handlers.set(eventName, handler);
    
    if (this.canvas && eventName === 'drop') {
      this.canvas.addEventListener('drop', handler as EventListener);
      this.canvas.addEventListener('dragover', this.handleDragOver);
    }
  }

  /**
   * Unregister an event handler
   */
  off(eventName: string, handler: DropHandler): void {
    if (this.canvas && eventName === 'drop') {
      this.canvas.removeEventListener('drop', handler as EventListener);
      this.canvas.removeEventListener('dragover', this.handleDragOver);
    }
    this.handlers.delete(eventName);
  }

  /**
   * Handle dragover event
   */
  private handleDragOver = (event: DragEvent): void => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'copy';
    }
  };

  /**
   * Cleanup all handlers
   */
  cleanup(): void {
    if (this.canvas) {
      this.handlers.forEach((handler, eventName) => {
        if (eventName === 'drop') {
          this.canvas?.removeEventListener('drop', handler as EventListener);
          this.canvas?.removeEventListener('dragover', this.handleDragOver);
        }
      });
    }
    this.handlers.clear();
    this.canvas = null;
  }
}

// Export singleton instance
export const canvasDragDropService = new CanvasDragDropService();
