/**
 * Canvas Drag & Drop Service
 * Handles drag-and-drop interactions between Elements Sidebar and Canvas Preview
 * Provides intelligent element insertion with semantic understanding
 */

import { WebElement } from '@/components/creatives/ElementsSidebar';
import { SemanticPromptParser } from './semanticPromptParser';

export interface DropZone {
  id: string;
  type: 'canvas' | 'section' | 'container';
  acceptsElements: boolean;
  element?: HTMLElement;
}

export interface InsertionContext {
  position: 'append' | 'prepend' | 'before' | 'after';
  targetElement?: HTMLElement;
  dropZone?: DropZone;
}

export interface DragDropState {
  isDragging: boolean;
  draggedElement?: WebElement;
  activeDropZone?: DropZone;
  insertionPreview?: HTMLElement;
}

export class CanvasDragDropService {
  private static instance: CanvasDragDropService;
  private state: DragDropState = {
    isDragging: false
  };
  private listeners: Map<string, Set<(data?: unknown) => void>> = new Map();

  private constructor() {}

  static getInstance(): CanvasDragDropService {
    if (!this.instance) {
      this.instance = new CanvasDragDropService();
    }
    return this.instance;
  }

  /**
   * Initialize drag-and-drop on a canvas element
   */
  initializeCanvas(canvasElement: HTMLElement): void {
    canvasElement.addEventListener('dragover', this.handleDragOver.bind(this));
    canvasElement.addEventListener('dragleave', this.handleDragLeave.bind(this));
    canvasElement.addEventListener('drop', this.handleDrop.bind(this));
    canvasElement.dataset.dropZone = 'true';
  }

  /**
   * Remove drag-and-drop listeners from canvas
   */
  destroyCanvas(canvasElement: HTMLElement): void {
    canvasElement.removeEventListener('dragover', this.handleDragOver.bind(this));
    canvasElement.removeEventListener('dragleave', this.handleDragLeave.bind(this));
    canvasElement.removeEventListener('drop', this.handleDrop.bind(this));
    delete canvasElement.dataset.dropZone;
  }

  /**
   * Handle drag start from Elements Sidebar
   */
  onDragStart(element: WebElement): void {
    this.state = {
      ...this.state,
      isDragging: true,
      draggedElement: element
    };
    this.notifyListeners('dragStart');
  }

  /**
   * Handle drag end
   */
  onDragEnd(): void {
    this.removeInsertionPreview();
    this.state = {
      isDragging: false,
      draggedElement: undefined,
      activeDropZone: undefined,
      insertionPreview: undefined
    };
    this.notifyListeners('dragEnd');
  }

  /**
   * Handle dragover event on canvas
   */
  private handleDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();

    if (!this.state.isDragging || !this.state.draggedElement) return;

    const target = e.target as HTMLElement;
    const dropZone = this.findDropZone(target);

    if (dropZone) {
      e.dataTransfer!.dropEffect = 'copy';
      this.showInsertionPreview(e, dropZone);
      
      this.state = {
        ...this.state,
        activeDropZone: dropZone
      };
    }
  }

  /**
   * Handle dragleave event
   */
  private handleDragLeave(e: DragEvent): void {
    const relatedTarget = e.relatedTarget as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;

    // Only remove preview if leaving the canvas entirely
    if (!currentTarget.contains(relatedTarget)) {
      this.removeInsertionPreview();
    }
  }

  /**
   * Handle drop event
   */
  private handleDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();

    if (!this.state.draggedElement) return;

    const elementData = e.dataTransfer?.getData('application/json');
    const htmlContent = e.dataTransfer?.getData('text/html');

    if (!elementData || !htmlContent) {
      console.error('No element data in drop event');
      return;
    }

    try {
      const element: WebElement = JSON.parse(elementData);
      const insertionContext = this.calculateInsertionContext(e);
      
      this.insertElement(element, htmlContent, insertionContext);
      
      this.notifyListeners('drop', {
        element,
        context: insertionContext
      });

    } catch (error) {
      console.error('Error handling drop:', error);
    } finally {
      this.onDragEnd();
    }
  }

  /**
   * Find the appropriate drop zone for a target element
   */
  private findDropZone(target: HTMLElement): DropZone | null {
    let current: HTMLElement | null = target;

    while (current) {
      if (current.dataset.dropZone === 'true') {
        return {
          id: current.id || 'canvas-root',
          type: this.getDropZoneType(current),
          acceptsElements: true,
          element: current
        };
      }
      current = current.parentElement;
    }

    return null;
  }

  /**
   * Determine drop zone type from element
   */
  private getDropZoneType(element: HTMLElement): DropZone['type'] {
    const tagName = element.tagName.toLowerCase();
    
    if (tagName === 'section' || element.classList.contains('section')) {
      return 'section';
    }
    
    if (tagName === 'div' && element.classList.contains('container')) {
      return 'container';
    }

    return 'canvas';
  }

  /**
   * Calculate where to insert the element
   */
  private calculateInsertionContext(e: DragEvent): InsertionContext {
    const target = e.target as HTMLElement;
    const canvas = this.findCanvas(target);

    if (!canvas) {
      return { position: 'append' };
    }

    // Get all child sections/containers
    const children = Array.from(canvas.children) as HTMLElement[];
    
    if (children.length === 0) {
      return { position: 'append', targetElement: canvas };
    }

    // Find closest insertion point based on mouse Y position
    const mouseY = e.clientY;
    let closestChild: HTMLElement | null = null;
    let minDistance = Infinity;
    let insertBefore = false;

    children.forEach(child => {
      const rect = child.getBoundingClientRect();
      const childCenterY = rect.top + rect.height / 2;
      const distance = Math.abs(mouseY - childCenterY);

      if (distance < minDistance) {
        minDistance = distance;
        closestChild = child;
        insertBefore = mouseY < childCenterY;
      }
    });

    if (closestChild) {
      return {
        position: insertBefore ? 'before' : 'after',
        targetElement: closestChild
      };
    }

    return { position: 'append', targetElement: canvas };
  }

  /**
   * Show visual preview of where element will be inserted
   */
  private showInsertionPreview(e: DragEvent, dropZone: DropZone): void {
    this.removeInsertionPreview();

    const preview = document.createElement('div');
    preview.className = 'insertion-preview';
    preview.style.cssText = `
      position: absolute;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #3B82F6, #8B5CF6);
      pointer-events: none;
      z-index: 9999;
      border-radius: 2px;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
    `;

    const context = this.calculateInsertionContext(e);
    const targetElement = context.targetElement || dropZone.element;

    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const canvasRect = this.findCanvas(targetElement)?.getBoundingClientRect();

    if (!canvasRect) return;

    if (context.position === 'before') {
      preview.style.top = `${rect.top - canvasRect.top}px`;
    } else if (context.position === 'after') {
      preview.style.top = `${rect.bottom - canvasRect.top}px`;
    } else {
      preview.style.top = `${rect.bottom - canvasRect.top}px`;
    }

    const canvas = this.findCanvas(targetElement);
    if (canvas) {
      canvas.style.position = 'relative';
      canvas.appendChild(preview);
      this.state.insertionPreview = preview;
    }
  }

  /**
   * Remove insertion preview
   */
  private removeInsertionPreview(): void {
    if (this.state.insertionPreview) {
      this.state.insertionPreview.remove();
      this.state.insertionPreview = undefined;
    }
  }

  /**
   * Insert element into canvas
   */
  private insertElement(
    element: WebElement,
    htmlContent: string,
    context: InsertionContext
  ): void {
    const wrapper = document.createElement('div');
    wrapper.className = 'canvas-element-wrapper';
    wrapper.dataset.elementId = element.id;
    wrapper.dataset.elementCategory = element.category;
    wrapper.style.cssText = 'position: relative;';

    // Add element controls overlay
    const controls = this.createElementControls(element);
    wrapper.appendChild(controls);

    // Parse and insert HTML content
    const contentWrapper = document.createElement('div');
    contentWrapper.innerHTML = htmlContent;
    wrapper.appendChild(contentWrapper);

    // Insert into DOM based on context
    if (context.position === 'before' && context.targetElement) {
      context.targetElement.parentElement?.insertBefore(wrapper, context.targetElement);
    } else if (context.position === 'after' && context.targetElement) {
      context.targetElement.parentElement?.insertBefore(wrapper, context.targetElement.nextSibling);
    } else if (context.position === 'prepend' && context.targetElement) {
      context.targetElement.insertBefore(wrapper, context.targetElement.firstChild);
    } else if (context.targetElement) {
      context.targetElement.appendChild(wrapper);
    }

    // Trigger animation
    setTimeout(() => {
      wrapper.classList.add('element-inserted');
    }, 10);

    console.log(`✅ Inserted ${element.name} (${element.category})`);
  }

  /**
   * Create control overlay for canvas elements
   */
  private createElementControls(element: WebElement): HTMLElement {
    const controls = document.createElement('div');
    controls.className = 'element-controls';
    controls.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      background: rgba(59, 130, 246, 0.9);
      color: white;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 600;
      display: none;
      align-items: center;
      justify-content: space-between;
      z-index: 10;
      border-radius: 8px 8px 0 0;
    `;

    controls.innerHTML = `
      <span>${element.name}</span>
      <div class="flex gap-2">
        <button class="px-2 py-1 bg-white/20 rounded hover:bg-white/30" data-action="edit">Edit</button>
        <button class="px-2 py-1 bg-white/20 rounded hover:bg-white/30" data-action="duplicate">Duplicate</button>
        <button class="px-2 py-1 bg-red-500/80 rounded hover:bg-red-500" data-action="delete">Delete</button>
      </div>
    `;

    // Show controls on hover
    controls.parentElement?.addEventListener('mouseenter', () => {
      controls.style.display = 'flex';
    });
    controls.parentElement?.addEventListener('mouseleave', () => {
      controls.style.display = 'none';
    });

    // Handle control actions
    controls.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const action = target.dataset.action;
      
      if (action === 'delete') {
        controls.parentElement?.remove();
      } else if (action === 'duplicate') {
        const clone = controls.parentElement?.cloneNode(true) as HTMLElement;
        controls.parentElement?.parentElement?.insertBefore(clone, controls.parentElement.nextSibling);
      }
    });

    return controls;
  }

  /**
   * Find canvas element
   */
  private findCanvas(element: HTMLElement): HTMLElement | null {
    let current: HTMLElement | null = element;

    while (current) {
      if (current.dataset.dropZone === 'true') {
        return current;
      }
      current = current.parentElement;
    }

    return null;
  }

  /**
   * Subscribe to drag-drop events
   */
  on(event: string, callback: (data?: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  /**
   * Unsubscribe from drag-drop events
   */
  off(event: string, callback: (data?: unknown) => void): void {
    this.listeners.get(event)?.delete(callback);
  }

  /**
   * Notify listeners of state changes
   */
  private notifyListeners(event: string, data?: unknown): void {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  /**
   * Get current drag-drop state
   */
  getState(): DragDropState {
    return { ...this.state };
  }

  /**
   * Export canvas HTML
   */
  exportCanvasHTML(canvasElement: HTMLElement): string {
    const clone = canvasElement.cloneNode(true) as HTMLElement;
    
    // Remove all element controls
    clone.querySelectorAll('.element-controls').forEach(el => el.remove());
    
    // Remove wrapper classes
    clone.querySelectorAll('.canvas-element-wrapper').forEach(el => {
      const wrapper = el as HTMLElement;
      while (wrapper.firstChild) {
        wrapper.parentElement?.insertBefore(wrapper.firstChild, wrapper);
      }
      wrapper.remove();
    });

    return clone.innerHTML;
  }

  /**
   * Clear canvas
   */
  clearCanvas(canvasElement: HTMLElement): void {
    canvasElement.innerHTML = '';
  }

  /**
   * Get element count on canvas
   */
  getElementCount(canvasElement: HTMLElement): number {
    return canvasElement.querySelectorAll('.canvas-element-wrapper').length;
  }
}

export default CanvasDragDropService;
