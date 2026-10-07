import type { ProjectRecord } from '@/services/projectSchemaCompat';

export interface WorkspaceDraftRecord {
  id: string;
  project_id?: string | null;
  business_id?: string | null;
  name?: string | null;
  metadata?: Record<string, unknown> | null;
  last_revision_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface WorkspaceProjectRecord extends Omit<ProjectRecord, 'created_at'> {
  created_at: string;
  draft_id?: string | null;
  revision_id?: string | null;
  draft_only?: boolean;
}

function getDraftName(draft: WorkspaceDraftRecord) {
  return String(
    draft.name ||
      draft.metadata?.projectName ||
      draft.metadata?.name ||
      'Untitled project',
  );
}

/** Join Cloud metadata with its latest durable Web Builder draft. */
export function mergeWorkspaceProjects(
  projects: ProjectRecord[],
  drafts: WorkspaceDraftRecord[],
): WorkspaceProjectRecord[] {
  const latestDraftByProject = new Map<string, WorkspaceDraftRecord>();
  for (const draft of drafts) {
    if (!draft.project_id) continue;
    const previous = latestDraftByProject.get(draft.project_id);
    if (!previous || String(draft.updated_at || '') > String(previous.updated_at || '')) {
      latestDraftByProject.set(draft.project_id, draft);
    }
  }

  const represented = new Set(projects.map((project) => project.id));
  const result: WorkspaceProjectRecord[] = projects.map((project) => {
    const latestDraft = latestDraftByProject.get(project.id);
    const projectUpdatedAt = String(project.updated_at || project.created_at || '');
    const draftUpdatedAt = String(latestDraft?.updated_at || '');
    return {
      ...project,
      created_at: project.created_at || project.updated_at || new Date(0).toISOString(),
      // Draft commits can advance without changing projects.updated_at. Carry
      // that durable activity into the profile ordering and card freshness.
      updated_at: draftUpdatedAt > projectUpdatedAt ? latestDraft?.updated_at || null : project.updated_at || null,
      draft_id: latestDraft?.id ?? null,
      revision_id: latestDraft?.last_revision_id ?? null,
    };
  });

  // Defensive visibility for rows awaiting trigger/backfill synchronization.
  for (const draft of drafts) {
    if (draft.project_id && represented.has(draft.project_id)) continue;
    result.push({
      id: draft.project_id || draft.id,
      name: getDraftName(draft),
      description: String(draft.metadata?.description || '') || null,
      owner_id: null,
      business_id: draft.business_id ?? null,
      status: 'draft',
      publish_status: 'draft',
      created_at: draft.created_at || draft.updated_at || new Date(0).toISOString(),
      updated_at: draft.updated_at || draft.created_at || null,
      draft_id: draft.id,
      revision_id: draft.last_revision_id ?? null,
      draft_only: !draft.project_id,
    });
  }

  return result.sort((a, b) =>
    String(b.updated_at || b.created_at).localeCompare(String(a.updated_at || a.created_at)),
  );
}
