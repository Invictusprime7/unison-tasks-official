import type { Canvas as FabricCanvas, Group, Object as FabricObject, StaticCanvas } from 'fabric';
import type { ComponentDefinition } from '@/types/components';
import { nanoid } from 'nanoid';

export function createComponentFromSelection(canvas: FabricCanvas, name: string): ComponentDefinition | null {
  const sel = canvas.getActiveObject();
  if (!sel) return null;
  const group = sel as unknown as Group | FabricObject;
  const json = group.toObject();
  return {
    id: nanoid(),
    name,
    rootJson: json,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function generateObjectThumbnail(canvas: FabricCanvas, object: any, maxSize = 160): Promise<string | null> {
  try {
    const rect = object.getBoundingRect(true, true);
    const scale = Math.min(maxSize / rect.width, maxSize / rect.height, 1);
    const off = new (window as any).fabric.StaticCanvas(null, { width: Math.ceil(rect.width * scale), height: Math.ceil(rect.height * scale) }) as StaticCanvas;
    const clone: any = await new Promise((res) => object.clone((c: any) => res(c)));
    clone.set({ left: 0, top: 0, scaleX: (object.scaleX || 1) * scale, scaleY: (object.scaleY || 1) * scale, angle: object.angle || 0 });
    // Normalize position to top-left
    clone.setCoords();
    off.add(clone);
    off.renderAll();
    return off.toDataURL({ format: 'png', multiplier: 1 });
  } catch {
    return null;
  }
}
