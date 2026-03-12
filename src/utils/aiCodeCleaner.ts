/**
 * AI Code Cleaner
 * Strips explanatory text from AI responses that mix prose with raw code.
 * Handles responses where the AI returns text + HTML/JSX without proper code fences,
 * and detects pure-markdown responses that contain no usable code at all.
 */

/**
 * Extract clean code from an AI response that may contain explanatory text
 * mixed with raw HTML, JSX/TSX, or JavaScript code.
 *
 * Priority order:
 * 1. Markdown code blocks with language tags (```html ... ```)
 * 2. Raw HTML documents (<!DOCTYPE html> or <html>)
 * 3. React/JSX imports (import React ...)
 * 4. Export default function patterns
 * 5. Detect pure-markdown / prose-only → return empty string
 * 6. Pass-through if already clean code
 */
export function extractCleanCode(input: string): string {
  if (!input || typeof input !== 'string') return input || '';

  const trimmed = input.trim();

  // 1. If content has markdown code blocks with a language, extract the largest one
  const fenceMatches = [...trimmed.matchAll(
    /```(?:html|jsx|tsx|javascript|js|typescript|ts)\s*\n([\s\S]*?)```/g
  )];
  if (fenceMatches.length > 0) {
    // Return the longest code block (most likely the full template)
    const best = fenceMatches.reduce((a, b) =>
      (a[1]?.length ?? 0) >= (b[1]?.length ?? 0) ? a : b
    );
    const code = best[1]?.trim();
    if (code && code.length > 20) return code;
  }

  // 2. If content contains a full HTML document, strip everything before it
  const doctypeIdx = trimmed.search(/<!DOCTYPE\s+html/i);
  if (doctypeIdx >= 0) {
    return trimmed.slice(doctypeIdx).trim();
  }

  const htmlTagIdx = trimmed.search(/<html[\s>]/i);
  if (htmlTagIdx >= 0) {
    return trimmed.slice(htmlTagIdx).trim();
  }

  // 3. If content starts with non-code text before a React import statement
  const importIdx = trimmed.search(/^import\s+/m);
  if (importIdx > 0) {
    const textBefore = trimmed.slice(0, importIdx);
    if (looksLikeProse(textBefore)) {
      return trimmed.slice(importIdx).trim();
    }
  }

  // 4. If content starts with prose before an export default function
  const exportIdx = trimmed.search(/^export\s+default\s+function/m);
  if (exportIdx > 0) {
    const textBefore = trimmed.slice(0, exportIdx);
    if (looksLikeProse(textBefore)) {
      return trimmed.slice(exportIdx).trim();
    }
  }

  // 5. Check if this is pure markdown / prose with no actual code
  //    (AI returned explanation instead of code)
  if (isPureMarkdownOrProse(trimmed)) {
    return '';
  }

  // 6. Already starts with code — return as-is
  return trimmed;
}

/**
 * Returns true if the input is clearly code (not markdown/prose).
 * Used as a guard before storing content into VFS files.
 */
export function looksLikeCode(input: string): boolean {
  if (!input || typeof input !== 'string') return false;
  const t = input.trim();
  if (!t || t.length < 20) return false;

  // Starts with typical code patterns
  if (/^\s*(<!DOCTYPE|<html|<head|<body|<div|<section|<header|<main)/i.test(t)) return true;
  if (/^\s*(import\s+|export\s+(default\s+)?|const\s+|function\s+|class\s+)/m.test(t)) return true;
  // Contains balanced HTML/JSX tags (at least a few)
  const tagCount = (t.match(/<\/?[a-zA-Z][a-zA-Z0-9]*[\s>]/g) || []).length;
  if (tagCount >= 4) return true;

  return false;
}

/**
 * Heuristic: returns true if the text looks like natural-language prose
 * rather than source code.
 */
function looksLikeProse(text: string): boolean {
  const t = text.trim();
  if (!t) return false;

  // Contains sentences (words followed by periods)
  const hasSentences = /[A-Za-z]{2,}\.\s/.test(t);
  // Starts with a capital letter word (typical of prose)
  const startsWithWord = /^[A-Z][a-z]+/.test(t);
  // Contains common prose phrases
  const hasProsePatterns =
    /\b(I will|Let me|Here is|Here's|This is|First|Now|Next|Start|Sure|Great|OK|Okay|Below|Above|following|changes|modify|update)\b/i.test(t);

  return hasSentences || (startsWithWord && hasProsePatterns);
}

/**
 * Detect if the input is pure markdown/explanation with no actual renderable code.
 * Key signals: markdown headings, bullet lists, backtick-wrapped identifiers,
 * and NO actual HTML tags or import/export statements at the top level.
 */
function isPureMarkdownOrProse(text: string): boolean {
  // Markdown signals
  const markdownHeadings = (text.match(/^#{1,6}\s+/gm) || []).length;
  const bulletPoints = (text.match(/^\s*[-*]\s+/gm) || []).length;
  const boldPatterns = (text.match(/\*\*[^*]+\*\*/g) || []).length;
  const inlineCode = (text.match(/`[^`]+`/g) || []).length;
  const arrowItems = (text.match(/^\s*->/gm) || []).length;

  const markdownScore = markdownHeadings + bulletPoints + boldPatterns * 0.5 + arrowItems;

  // Code signals — look for actual top-level code, not identifiers mentioned in prose
  const hasTopLevelImport = /^import\s+\w/m.test(text);
  const hasTopLevelExport = /^export\s+(default\s+)?/m.test(text);
  const startsWithTag = /^\s*<(!DOCTYPE|html|head|body|div|section)/i.test(text);
  const hasSubstantialTags = ((text.match(/<\/?[a-zA-Z][a-zA-Z0-9]*[\s>/]/g) || []).length) >= 6;

  // If heavy markdown signals AND no real top-level code → it's prose
  if (markdownScore >= 3 && !hasTopLevelImport && !hasTopLevelExport && !startsWithTag && !hasSubstantialTags) {
    return true;
  }

  // If content has lots of inline code backticks + bullets but no actual HTML structure
  if (inlineCode >= 5 && bulletPoints >= 3 && !hasSubstantialTags && !startsWithTag) {
    return true;
  }

  return false;
}
