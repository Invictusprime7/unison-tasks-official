/**
 * Redirect Page Generator
 * 
 * Parses multi-page AI output using <!-- PAGE: /path.html --> markers,
 * splits into separate VFS files, and generates a react-router App.tsx
 * for Sandpack-based preview rendering.
 * 
 * Flow:
 * 1. Systems AI generates HTML with PAGE markers
 * 2. This utility parses the output into individual page files
 * 3. Pages are written to VFS as separate .html files
 * 4. A routing wrapper is generated for Sandpack preview
 * 5. Context is shared with in-builder AI for site-wide awareness
 */

// ============================================================================
// Types
// ============================================================================

export interface RedirectPage {
  /** Page path, e.g. "/checkout" */
  path: string;
  /** File name in VFS, e.g. "checkout.html" */
  fileName: string;
  /** Full HTML content of the page */
  content: string;
  /** Human-readable label extracted from nav or title */
  label: string;
  /** Whether this is the main/index page */
  isMain: boolean;
}

export interface MultiPageParseResult {
  /** The main page (index) */
  mainPage: RedirectPage;
  /** All redirect/sub pages */
  redirectPages: RedirectPage[];
  /** All pages including main */
  allPages: RedirectPage[];
  /** VFS file map ready for import */
  vfsFiles: Record<string, string>;
  /** Summary for AI context sharing */
  contextSummary: string;
}

// ============================================================================
// Parser
// ============================================================================

const PAGE_MARKER_RE = /<!--\s*PAGE:\s*([^\s>]+)\s*(?:label="([^"]*)")?\s*-->/gi;

/**
 * Parse multi-page AI output into separate pages.
 * 
 * Expected format:
 * ```
 * <!-- PAGE: /index.html -->
 * <!DOCTYPE html>...main page...</html>
 * <!-- PAGE: /checkout.html label="Checkout" -->
 * <!DOCTYPE html>...checkout page...</html>
 * ```
 * 
 * If no PAGE markers found, treats entire output as single main page.
 */
export function parseMultiPageOutput(rawOutput: string): MultiPageParseResult {
  const pages: RedirectPage[] = [];
  
  // Find all PAGE markers and their positions
  const markers: { path: string; label: string; index: number }[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(PAGE_MARKER_RE.source, PAGE_MARKER_RE.flags);
  
  while ((match = re.exec(rawOutput)) !== null) {
    markers.push({
      path: normalizePath(match[1]),
      label: match[2] || '',
      index: match.index,
    });
  }
  
  if (markers.length === 0) {
    // No markers — treat entire output as single main page
    const mainPage = buildPage('/index.html', rawOutput.trim(), '', true);
    return buildResult(mainPage, []);
  }
  
  // Split content between markers
  for (let i = 0; i < markers.length; i++) {
    const markerEnd = rawOutput.indexOf('-->', markers[i].index) + 3;
    const contentStart = markerEnd;
    const contentEnd = i + 1 < markers.length ? markers[i + 1].index : rawOutput.length;
    const content = rawOutput.slice(contentStart, contentEnd).trim();
    
    const isMain = markers[i].path === '/index.html' || markers[i].path === '/' || i === 0;
    pages.push(buildPage(markers[i].path, content, markers[i].label, isMain));
  }
  
  // Ensure we have a main page
  const mainPage = pages.find(p => p.isMain) || pages[0];
  if (mainPage) mainPage.isMain = true;
  
  const redirectPages = pages.filter(p => !p.isMain);
  
  return buildResult(mainPage, redirectPages);
}

// ============================================================================
// VFS File Generation
// ============================================================================

/**
 * Generate VFS files for multi-page Sandpack preview.
 * Creates individual HTML files and a routing App.tsx with react-router-dom.
 */
export function generateMultiPageVFS(result: MultiPageParseResult): Record<string, string> {
  const files: Record<string, string> = {};
  
  // Write each page as a standalone HTML file in VFS
  for (const page of result.allPages) {
    files[`/${page.fileName}`] = page.content;
  }
  
  // If only one page, no routing needed
  if (result.redirectPages.length === 0) {
    return files;
  }
  
  // Generate a React router wrapper for multi-page navigation
  const routerApp = generateRouterApp(result);
  files['/src/App.tsx'] = routerApp;
  files['/src/main.tsx'] = generateMainTsx();
  files['/src/index.css'] = generateBaseCss();
  
  // Generate individual page components that render HTML via dangerouslySetInnerHTML
  for (const page of result.allPages) {
    const componentName = pathToComponentName(page.path);
    files[`/src/pages/${componentName}.tsx`] = generatePageComponent(componentName, page.content);
  }
  
  return files;
}

// ============================================================================
// AI Context Generation
// ============================================================================

/**
 * Build a context string for in-builder AI to understand the site structure.
 * This enables the AI assistant to make site-wide customizations.
 */
export function buildRedirectPageContext(result: MultiPageParseResult): string {
  const lines: string[] = [];
  lines.push('\n=== MULTI-PAGE SITE STRUCTURE ===');
  lines.push(`Total pages: ${result.allPages.length}`);
  lines.push('');
  
  for (const page of result.allPages) {
    const sections = extractSectionNames(page.content);
    const intents = extractIntents(page.content);
    lines.push(`📄 ${page.label || page.fileName} (${page.path})${page.isMain ? ' [MAIN]' : ''}`);
    if (sections.length > 0) lines.push(`   Sections: ${sections.join(', ')}`);
    if (intents.length > 0) lines.push(`   Intents: ${intents.join(', ')}`);
    lines.push(`   Size: ${page.content.length} chars`);
  }
  
  lines.push('');
  lines.push('Rules for site-wide edits:');
  lines.push('- Changes to nav/footer should be applied across ALL pages');
  lines.push('- Brand colors, fonts, and design tokens must be consistent');
  lines.push('- Redirect pages share the same Tailwind config as the main page');
  lines.push('- Use <!-- PAGE: /path.html label="Label" --> markers when adding new pages');
  
  return lines.join('\n');
}

/**
 * Detect if AI output contains multi-page markers
 */
export function hasMultiPageMarkers(code: string): boolean {
  return PAGE_MARKER_RE.test(code);
}

/**
 * Analyze main page HTML to suggest redirect pages the AI should create.
 * Inspects navigation links for pages that don't exist yet.
 */
export function suggestRedirectPages(mainPageHtml: string): string[] {
  const suggestions: string[] = [];
  
  // Find nav links that point to internal pages
  const linkRe = /href=["']\/?([\w-]+)\.html["']/gi;
  let linkMatch: RegExpExecArray | null;
  while ((linkMatch = linkRe.exec(mainPageHtml)) !== null) {
    const pageName = linkMatch[1];
    if (pageName !== 'index' && !suggestions.includes(pageName)) {
      suggestions.push(pageName);
    }
  }
  
  // Also check data-ut-path attributes
  const pathRe = /data-ut-path=["']\/?([\w-]+)(?:\.html)?["']/gi;
  while ((linkMatch = pathRe.exec(mainPageHtml)) !== null) {
    const pageName = linkMatch[1];
    if (pageName !== 'index' && !suggestions.includes(pageName)) {
      suggestions.push(pageName);
    }
  }
  
  return suggestions;
}

// ============================================================================
// Helpers
// ============================================================================

function normalizePath(path: string): string {
  let p = path.trim();
  if (!p.startsWith('/')) p = '/' + p;
  if (!p.includes('.') && p !== '/') p += '.html';
  if (p === '/') p = '/index.html';
  return p;
}

function buildPage(path: string, content: string, label: string, isMain: boolean): RedirectPage {
  const fileName = path.replace(/^\//, '');
  const inferredLabel = label || extractTitle(content) || fileNameToLabel(fileName);
  
  return {
    path,
    fileName,
    content,
    label: inferredLabel,
    isMain,
  };
}

function buildResult(mainPage: RedirectPage, redirectPages: RedirectPage[]): MultiPageParseResult {
  const allPages = [mainPage, ...redirectPages];
  
  const vfsFiles: Record<string, string> = {};
  for (const page of allPages) {
    vfsFiles[`/${page.fileName}`] = page.content;
  }
  
  const contextSummary = buildRedirectPageContext({ mainPage, redirectPages, allPages, vfsFiles, contextSummary: '' });
  
  return {
    mainPage,
    redirectPages,
    allPages,
    vfsFiles,
    contextSummary,
  };
}

function extractTitle(html: string): string {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].trim() : '';
}

function fileNameToLabel(fileName: string): string {
  return fileName
    .replace(/\.html$/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function pathToComponentName(path: string): string {
  return path
    .replace(/^\//, '')
    .replace(/\.html$/, '')
    .replace(/[-_](\w)/g, (_, c) => c.toUpperCase())
    .replace(/^\w/, c => c.toUpperCase()) + 'Page';
}

function extractSectionNames(html: string): string[] {
  const sections: string[] = [];
  const sectionRe = /id=["']([\w-]+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = sectionRe.exec(html)) !== null) {
    const id = m[1];
    if (!id.startsWith('_') && !['root', 'app', 'main'].includes(id)) {
      sections.push(id);
    }
  }
  return [...new Set(sections)].slice(0, 10);
}

function extractIntents(html: string): string[] {
  const intents: string[] = [];
  const intentRe = /data-ut-intent=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = intentRe.exec(html)) !== null) {
    if (!intents.includes(m[1])) intents.push(m[1]);
  }
  return intents;
}

// ============================================================================
// React Router Code Generation (for Sandpack multi-page preview)
// ============================================================================

function generateRouterApp(result: MultiPageParseResult): string {
  const imports = result.allPages
    .map(p => {
      const name = pathToComponentName(p.path);
      return `import ${name} from './pages/${name}';`;
    })
    .join('\n');
  
  const routes = result.allPages
    .map(p => {
      const name = pathToComponentName(p.path);
      const routePath = p.isMain ? '/' : p.path.replace(/\.html$/, '');
      return `        <Route path="${routePath}" element={<${name} />} />`;
    })
    .join('\n');
  
  // Add catch-all redirect to main page
  // Use HashRouter for preview compatibility (works in iframes without server rewrites)
  // Production builds can switch to BrowserRouter if needed
  return `import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
${imports}

export default function App() {
  return (
    <HashRouter>
      <Routes>
${routes}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
`;
}

function generatePageComponent(componentName: string, html: string): string {
  // Extract body content if full HTML doc
  let bodyContent = html;
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    bodyContent = bodyMatch[1];
  }
  
  // Extract head styles/scripts for injection
  const headStyles = extractHeadContent(html);
  
  const escapedHtml = bodyContent
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
  
  const escapedHead = headStyles
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
  
  return `import React, { useEffect, useRef } from 'react';

export default function ${componentName}() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Inject scripts after render
    if (containerRef.current) {
      const scripts = containerRef.current.querySelectorAll('script');
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        if (oldScript.src) {
          newScript.src = oldScript.src;
        } else {
          newScript.textContent = oldScript.textContent;
        }
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    }
  }, []);
  
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: \`${escapedHead}\` }} />
      <div 
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: \`${escapedHtml}\` }}
      />
    </>
  );
}
`;
}

function extractHeadContent(html: string): string {
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  if (!headMatch) return '';
  
  const head = headMatch[1];
  // Extract style and script tags from head
  const parts: string[] = [];
  
  const styleRe = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let m: RegExpExecArray | null;
  while ((m = styleRe.exec(head)) !== null) {
    parts.push(m[0]);
  }
  
  // Extract Tailwind config script
  const scriptRe = /<script(?:\s[^>]*)?>[\s\S]*?tailwind\.config[\s\S]*?<\/script>/gi;
  while ((m = scriptRe.exec(head)) !== null) {
    parts.push(m[0]);
  }
  
  return parts.join('\n');
}

function generateMainTsx(): string {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
}

function generateBaseCss(): string {
  return `:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
}

* { border-color: hsl(var(--border, 214.3 31.8% 91.4%)); }

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
`;
}
