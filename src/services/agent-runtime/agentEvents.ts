/**
 * Structured agent events — the one activity vocabulary shared by the AI
 * Builder, the command menu and (later) Wizard launches. Events ride the
 * existing `vfsEventBus` under `agent:event`; there is no second bus.
 * Events describe work; they are never a source of project state.
 */
import { vfsEventBus } from '@/services/vfsEventBus';

export type AgentEventKind =
  | 'understanding'
  | 'discovery'
  | 'plan'
  | 'tool_call'
  | 'file_change'
  | 'data_change'
  | 'verification'
  | 'error'
  | 'rollback'
  | 'commit';

export interface AgentEvent {
  kind: AgentEventKind;
  /** Short human sentence, shown verbatim in the activity feed. */
  message: string;
  /** Groups events of one request. */
  runId?: string;
  status?: 'running' | 'ok' | 'failed';
  path?: string;
  added?: number;
  removed?: number;
  revisionId?: string | null;
}

export function emitAgentEvent(event: AgentEvent): void {
  vfsEventBus.emit<AgentEvent>('agent:event', event);
}

export function onAgentEvent(listener: (event: AgentEvent, timestamp: number) => void): () => void {
  return vfsEventBus.on<AgentEvent>('agent:event', (e) => listener(e.payload, e.timestamp));
}

/** Line-level +/- counts for the activity feed (cheap, not a real diff). */
export function lineDelta(before: string | undefined, after: string | undefined): { added: number; removed: number } {
  const a = new Set((before ?? '').split('\n'));
  const b = new Set((after ?? '').split('\n'));
  let added = 0;
  let removed = 0;
  b.forEach((l) => { if (!a.has(l)) added++; });
  a.forEach((l) => { if (!b.has(l)) removed++; });
  return { added, removed };
}
