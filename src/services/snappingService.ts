import type { Canvas as FabricCanvas, Object as FabricObject } from 'fabric';

export interface GuideLine {
  type: 'v' | 'h';
  position: number; // canvas coord in object space
}

export interface SnapResult {
  left: number;
  top: number;
  guides: GuideLine[];
}

export function snapObject(canvas: FabricCanvas, target: FabricObject, threshold = 6): SnapResult {
  const objects = canvas.getObjects().filter((o) => o !== target);
  const tA = target.getBoundingRect(true, true);
  const guides: GuideLine[] = [];

  let { left, top } = target;
  left = left || 0; top = top || 0;

  // Candidate lines: edges and centers of other objects and canvas center
  const vLines: number[] = [canvas.getWidth()! / 2];
  const hLines: number[] = [canvas.getHeight()! / 2];

  objects.forEach((o) => {
    const r = o.getBoundingRect(true, true);
    vLines.push(r.left, r.left + r.width / 2, r.left + r.width);
    hLines.push(r.top, r.top + r.height / 2, r.top + r.height);
  });

  // Compute current rect for target based on proposed left/top
  const curRect = (l: number, t: number) => ({ left: l, top: t, right: l + tA.width, bottom: t + tA.height, cx: l + tA.width / 2, cy: t + tA.height / 2 });
  let bestDX = 0, bestDY = 0;

  // Snap X (vertical guides)
  const cx = tA.left + tA.width / 2;
  const candidatesX = [tA.left, cx, tA.left + tA.width];
  for (const lCandidate of candidatesX) {
    for (const v of vLines) {
      const d = Math.abs(lCandidate - v);
      if (d <= threshold) {
        const dx = v - lCandidate;
        if (Math.abs(dx) < Math.abs(bestDX) || bestDX === 0) {
          bestDX = dx;
        }
      }
    }
  }

  // Snap Y (horizontal guides)
  const cy = tA.top + tA.height / 2;
  const candidatesY = [tA.top, cy, tA.top + tA.height];
  for (const tCandidate of candidatesY) {
    for (const h of hLines) {
      const d = Math.abs(tCandidate - h);
      if (d <= threshold) {
        const dy = h - tCandidate;
        if (Math.abs(dy) < Math.abs(bestDY) || bestDY === 0) {
          bestDY = dy;
        }
      }
    }
  }

  const snappedLeft = (target.left || 0) + bestDX;
  const snappedTop = (target.top || 0) + bestDY;

  const r2 = curRect(snappedLeft, snappedTop);
  // Produce guide lines at snapped positions
  if (bestDX !== 0) {
    if (Math.abs(r2.left - (tA.left)) <= threshold) guides.push({ type: 'v', position: r2.left });
    if (Math.abs(r2.cx - (tA.left + tA.width / 2)) <= threshold) guides.push({ type: 'v', position: r2.cx });
    if (Math.abs(r2.right - (tA.left + tA.width)) <= threshold) guides.push({ type: 'v', position: r2.right });
  }
  if (bestDY !== 0) {
    if (Math.abs(r2.top - (tA.top)) <= threshold) guides.push({ type: 'h', position: r2.top });
    if (Math.abs(r2.cy - (tA.top + tA.height / 2)) <= threshold) guides.push({ type: 'h', position: r2.cy });
    if (Math.abs(r2.bottom - (tA.top + tA.height)) <= threshold) guides.push({ type: 'h', position: r2.bottom });
  }

  return { left: snappedLeft, top: snappedTop, guides };
}

