/** Scratch previews can exercise local UI without mutating the open builder. */
const scratchWindows = new WeakSet<object>();
export function isScratchPreviewMessage(event: MessageEvent): boolean {
  if (typeof document === 'undefined' || !event.source) return false;
  for (const frame of document.querySelectorAll<HTMLIFrameElement>('[data-composition-scratch] iframe')) {
    if (frame.contentWindow) scratchWindows.add(frame.contentWindow);
  }
  // Remember detached review frames so a late message cannot affect another project.
  return scratchWindows.has(event.source);
}
