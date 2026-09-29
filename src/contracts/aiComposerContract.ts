// AI Composer contract (milestone §31). Byte-mirrored at
// src/contracts/aiComposerContract.ts — edit both together.
import { z } from 'zod';

export const AI_COMPOSER_TASKS = ['site_page_author', 'site_page_repair', 'builder_source_edit'] as const;
export type AIComposerTask = (typeof AI_COMPOSER_TASKS)[number];

export const AI_COMPOSER_MODES: Record<AIComposerTask, string> = {
  site_page_author: 'site-page-author',
  site_page_repair: 'site-page-repair',
  builder_source_edit: 'builder-source-edit',
};

const PROTECTED = [
  /^\/src\/App\.tsx$/,
  /^\/src\/main\.tsx$/,
  /^\/src\/index\.css$/,
  /^\/package\.json$/,
  /^\/\.unison\//,
  /^\/src\/unison\//,
  /^\/src\/integrations\//,
];

export function isProtectedComposerPath(path: string): boolean {
  return PROTECTED.some((re) => re.test(path));
}

// Design-system write scope (workspace rules: never edit managed Unison source).
// Page authoring may write only its own page file and project-local
// components; canonical /src/components/** sections are read-only vocabulary.
export const PROJECT_COMPONENTS_DIR = '/src/project-components/';

export function composerScopeViolations(
  _task: AIComposerTask,
  _pageFilePath: string,
  ops: ReadonlyArray<{ type: string; path: string }>,
): string[] {
  return ops
    .filter((op) => isProtectedComposerPath(op.path))
    .map((op) => `${op.path}: canonical runtime file`);
}
export const AI_AUTHORED_MARKER = '// @unison-ai-authored';

const pathSchema = z.string().regex(/^\/(?:src|public)\/[A-Za-z0-9_\-./]+\.(tsx|ts|jsx|js|css|json)$/).refine((p) => !p.includes('..'));

export const aiComposerFileOpSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('create'), path: pathSchema, content: z.string().min(1) }).strict(),
  z.object({ type: z.literal('replace'), path: pathSchema, content: z.string().min(1) }).strict(),
  z.object({ type: z.literal('delete'), path: pathSchema }).strict(),
]);

export const aiComposerResponseSchema = z.object({
  summary: z.string().max(2000),
  fileOps: z.array(aiComposerFileOpSchema).min(1).max(48),
  requestedDependencies: z.array(z.string().max(80)).max(8).optional(),
  componentDecisions: z.array(z.object({
    family: z.string().max(60).optional(),
    implementationId: z.string().max(120).optional(),
    action: z.enum(['reuse', 'compose', 'invent']),
    reason: z.string().max(400).optional(),
  })).max(24).optional(),
  intentsUsed: z.array(z.string().max(80)).max(40).optional(),
}).strict();
export type AIComposerResponse = z.infer<typeof aiComposerResponseSchema>;

export const aiComposerRequestSchema = z.object({
  task: z.enum(AI_COMPOSER_TASKS),
  page: z.object({ role: z.string().max(60), title: z.string().max(120), route: z.string().max(200), filePath: pathSchema }),
  brief: z.string().max(12000),
  instruction: z.string().max(4000).optional(),
  files: z.record(z.string(), z.string().max(60000)),
  routes: z.array(z.object({ title: z.string().max(120), route: z.string().max(200) })).max(40),
  priorPages: z.array(z.object({ role: z.string().max(60), summary: z.string().max(2000) })).max(20).optional(),
  diagnostics: z.array(z.string().max(1000)).max(30).optional(),
  previousResponse: z.string().max(60000).optional(),
});
export type AIComposerRequest = z.infer<typeof aiComposerRequestSchema>;
