export interface BuilderCommitScope {
  projectId: string | null;
  draftId: string | null;
}

/** A late commit may update the active editor only when its full identity still matches. */
export function isActiveBuilderCommitScope(
  active: BuilderCommitScope,
  captured: BuilderCommitScope,
): boolean {
  return Boolean(
    captured.projectId
    && captured.draftId
    && active.projectId === captured.projectId
    && active.draftId === captured.draftId,
  );
}
