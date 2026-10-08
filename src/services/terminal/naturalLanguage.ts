/**
 * Natural-language understanding for the VFS terminal.
 *
 * Maps plain-English phrases to exact terminal commands. Read-only matches run
 * immediately; anything that changes the site is returned as a proposal the UI
 * confirms before running. Phrases with no local match return null — the caller
 * hands those to the AI Builder (one canonical agent; the terminal never calls
 * AI itself).
 */

import { buildSystemGraph } from '@/services/agent-runtime/systemGraph';

export interface NaturalMatch {
  /** The exact terminal command to run. */
  command: string;
  /** True when the command changes the site and needs user confirmation. */
  mutating: boolean;
  /** Plain-language description of what will happen, shown before running. */
  label: string;
}

const STOP = new Set(['the', 'a', 'an', 'my', 'this', 'that', 'page', 'section', 'on', 'of', 'to', 'in', 'please']);

function words(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9/\s-]/g, ' ').split(/\s+/).filter((w) => w && !STOP.has(w));
}

/** Find a page route from a loose word like "about" → "/about". */
function findPageRoute(files: Record<string, string>, hint: string): string | null {
  const graph = buildSystemGraph(files);
  const h = hint.toLowerCase().replace(/^\//, '');
  const exact = graph.pages.find((p) => p.route.replace(/^\//, '') === h || p.name.toLowerCase() === h);
  if (exact) return exact.route;
  const partial = graph.pages.find((p) => p.route.toLowerCase().includes(h) || p.name.toLowerCase().includes(h));
  return partial ? partial.route : null;
}

/** Find a section address from a loose name, optionally scoped to a page word. */
function findSectionAddress(files: Record<string, string>, sectionHint: string, pageHint?: string): string | null {
  const graph = buildSystemGraph(files);
  const h = sectionHint.toLowerCase();
  const pages = pageHint
    ? graph.pages.filter((p) => p.route.toLowerCase().includes(pageHint) || p.name.toLowerCase().includes(pageHint))
    : graph.pages;
  for (const page of pages) {
    const sec = page.sections.find((s) => s.id.toLowerCase() === h || s.nodeId.toLowerCase() === h)
      ?? page.sections.find((s) => s.id.toLowerCase().includes(h) || s.nodeId.toLowerCase().includes(h));
    if (sec) return `section:${page.route}#${sec.id}`;
  }
  return null;
}

/** Extract a "quoted" or 'quoted' phrase. */
function quoted(input: string): string | null {
  const m = /"([^"]+)"|'([^']+)'/.exec(input);
  return m ? (m[1] ?? m[2]) : null;
}

export function matchNaturalLanguage(input: string, files: Record<string, string>): NaturalMatch | null {
  const t = input.trim().toLowerCase();
  if (!t) return null;

  // ---- Read-only ----

  if (/^(show|list|what are|what's|whats)\b.*\bpages?\b/.test(t) || /^what pages/.test(t)) {
    return { command: 'routes', mutating: false, label: 'List your pages' };
  }
  if (/\bsite ?map\b|\bshow (the )?(graph|structure)\b|\bmap of (the )?site\b/.test(t)) {
    return { command: 'graph', mutating: false, label: 'Show the site map' };
  }
  if (/where do (the )?buttons? (go|lead)|button destinations|show (the )?(intents|buttons)/.test(t)) {
    return { command: 'intents', mutating: false, label: 'Show where each button leads' };
  }
  if (/^(check|diagnose|scan)\b.*\b(site|errors?|problems?|issues?)?\s*$/.test(t) || /what'?s wrong|any (errors|issues|problems)|find problems/.test(t)) {
    return { command: 'diagnose', mutating: false, label: 'Check the site for problems' };
  }
  if (/^(list|show)( the)? files\b/.test(t) || /^what files/.test(t)) {
    return { command: 'ls', mutating: false, label: 'List files' };
  }
  if (/what (version|revision)|which revision|current revision/.test(t)) {
    return { command: 'revision', mutating: false, label: 'Show the current saved version' };
  }
  const probeMatch = /(?:does the page (?:say|show|have)|is) ["']([^"']+)["']/.exec(input)
    ?? /(?:check|verify) (?:that )?(?:the page )?(?:says|shows|has) ["']([^"']+)["']/.exec(input);
  if (probeMatch) {
    return { command: `probe text "${probeMatch[1]}"`, mutating: false, label: `Check the live preview shows "${probeMatch[1]}"` };
  }
  const showFile = /^(?:show|open|cat|read)(?: me)?(?: the)? file (\S+)/.exec(t);
  if (showFile) {
    const path = showFile[1].startsWith('/') ? showFile[1] : `/src/${showFile[1]}`;
    return { command: `cat ${path}`, mutating: false, label: `Show ${path}` };
  }

  // ---- Mutating (need confirmation) ----

  const rename = /^rename (?:the )?(\w[\w-]*) page to ["']?([^"']+?)["']?$/.exec(t)
    ?? /^rename page (\/?[\w-]+) to ["']?([^"']+?)["']?$/.exec(t);
  if (rename) {
    const route = findPageRoute(files, rename[1]);
    if (!route) return null;
    const title = rename[2].trim();
    return { command: `page rename page:${route} "${title}"`, mutating: true, label: `Rename the ${route} page to "${title}"` };
  }

  const delSection = /^(?:delete|remove) (?:the )?([\w-]+) section(?: (?:on|from)(?: the)? (\w[\w-]*)?)?/.exec(t);
  if (delSection) {
    const addr = findSectionAddress(files, delSection[1], delSection[2]);
    if (!addr) return null;
    return { command: `section rm ${addr}`, mutating: true, label: `Remove the ${delSection[1]} section` };
  }

  const moveSection = /^move (?:the )?([\w-]+) section (up|down)(?: (?:on|in)(?: the)? (\w[\w-]*)?)?/.exec(t);
  if (moveSection) {
    const addr = findSectionAddress(files, moveSection[1], moveSection[3]);
    if (!addr) return null;
    return { command: `section ${moveSection[2]} ${addr}`, mutating: true, label: `Move the ${moveSection[1]} section ${moveSection[2]}` };
  }

  const createFile = /^(?:create|make|add)(?: a)?(?: new)? file (\S+)/.exec(t);
  if (createFile) {
    const path = createFile[1].startsWith('/') ? createFile[1] : `/src/${createFile[1]}`;
    return { command: `touch ${path}`, mutating: true, label: `Create ${path}` };
  }

  const delFile = /^(?:delete|remove) (?:the )?file (\S+)/.exec(t);
  if (delFile) {
    const path = delFile[1].startsWith('/') ? delFile[1] : `/src/${delFile[1]}`;
    return { command: `rm ${path}`, mutating: true, label: `Delete ${path}` };
  }

  return null;
}

/** True when a phrase looks like natural language rather than a mistyped command. */
export function looksLikeNaturalLanguage(input: string): boolean {
  const w = words(input);
  return w.length >= 3 || /\s/.test(input.trim());
}
