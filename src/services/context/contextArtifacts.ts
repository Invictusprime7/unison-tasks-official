/**
 * Context artifacts (guidebook §19): durable, project-owned material the AI
 * Builder may ground on (briefs, notes, extracted document text, screenshots),
 * kept out of page source. This module is the contract + AI projection; the
 * table lives in the site's own database once it has one (Phase 3).
 */
export type ContextArtifactKind = 'image' | 'markdown' | 'pdf-text' | 'docx-text' | 'reference-url' | 'client-note' | 'case-study-material';

export interface ContextArtifact {
  id: string;
  projectId: string;
  siteId: string | null;
  kind: ContextArtifactKind;
  title: string | null;
  storageAssetId: string | null;
  extractedText: string | null;
  summary: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export const CONTEXT_ARTIFACTS_SQL = `CREATE TABLE IF NOT EXISTS public.context_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  site_id uuid NOT NULL,
  kind text NOT NULL,
  title text,
  storage_asset_id uuid,
  extracted_text text,
  summary text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);`;

/**
 * Builds a compact AI context block. Only this project's artifacts are used,
 * summaries are preferred over raw text, and the total stays under `budget`.
 */
export function projectContextArtifactsForAI(artifacts: ContextArtifact[], projectId: string, budget = 6000): string {
  const own = artifacts.filter((a) => a.projectId === projectId);
  const lines: string[] = [];
  let used = 0;
  for (const a of own) {
    const body = (a.summary || a.extractedText || '').replace(/\s+/g, ' ').trim();
    const line = `- [${a.kind}] ${a.title ?? 'Untitled'}${body ? `: ${body}` : ''}`;
    const room = budget - used;
    if (room <= 40) break;
    const clipped = line.length > room ? `${line.slice(0, room - 1)}…` : line;
    lines.push(clipped);
    used += clipped.length + 1;
  }
  return lines.length ? `PROJECT CONTEXT\n${lines.join('\n')}` : '';
}
