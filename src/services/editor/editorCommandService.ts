/**
 * EditorCommandService (guidebook §21). Routes each command to its canonical
 * owner: resource → ResourceRuntime; source/presentation/route/binding → the
 * host's `commitMutation`-backed executors (§26). It never writes storage
 * itself and holds no state of its own.
 */
import type { ResourceContext } from '@/services/resources/resourceTypes';
import { canIssue } from './editorCapabilities';
import { resolvePropertyOwner } from './propertyOwnerResolver';
import { executeResourceCommand } from './executors/resourceExecutor';
import type { EditorCommand, EditorCommandResult, EditorCommandSource, EditorOwnerLane } from './editorCommandTypes';

/** Host-supplied executor for lanes owned by page source / topology / bindings. */
export type LaneExecutor = (command: EditorCommand) => Promise<EditorCommandResult>;

export interface EditorCommandContext {
  source: EditorCommandSource;
  resource: ResourceContext;
  executors?: Partial<Record<Exclude<EditorOwnerLane, 'resource'>, LaneExecutor>>;
}

export async function executeEditorCommand(command: EditorCommand, ctx: EditorCommandContext): Promise<EditorCommandResult> {
  const lane = resolvePropertyOwner(command);
  const fail = (error: string): EditorCommandResult => ({ ok: false, command: command.type, lane, savedTo: null, changedFields: [], error });
  if (!canIssue(ctx.source, command.type)) return fail(`This action isn't available from here.`);
  try {
    if (lane === 'resource') return await executeResourceCommand(command, ctx.resource);
    const exec = ctx.executors?.[lane];
    if (!exec) return fail('This change can’t be saved from here yet.');
    return await exec(command);
  } catch (e) {
    return fail(e instanceof Error ? e.message : String(e));
  }
}
