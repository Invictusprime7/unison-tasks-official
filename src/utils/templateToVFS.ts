/**
 * Template to VFS Converter
 * 
 * Converts HTML templates into React/TSX components for the VFS.
 * Supports both HTML-based templates and React component templates.
 */

import { htmlToJsx } from './aiWebParser';

// Template format types
export type TemplateFormat = 'html' | 'react' | 'mixed';

interface ConvertOptions {
  wrapInLayout?: boolean;
  componentName?: string;
  addTailwindStyles?: boolean;
}

/**
 * Detects the format of a template
 */
export function detectTemplateFormat(code: string): TemplateFormat {
  const trimmed = code.trim();
  
  // Check for HTML doctype or html tag
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    return 'html';
  }
  
  // Check for React imports or JSX patterns
  if (trimmed.includes('import React') || 
      trimmed.includes('export default') || 
      trimmed.includes('export function') ||
      trimmed.includes('const ') && (trimmed.includes('return (') || trimmed.includes('=> ('))) {
    return 'react';
  }
  
  // Check for HTML elements without doctype (partial HTML)
  if (trimmed.startsWith('<') && !trimmed.includes('import ')) {
    return 'html';
  }
  
  return 'mixed';
}

/**
 * Escapes content for use in JSX
 * Handles curly braces and other JSX-breaking characters
 */
function escapeForJsx(content: string): string {
  // Escape curly braces that aren't part of JSX expressions
  return content
    .replace(/\{/g, '&#123;')
    .replace(/\}/g, '&#125;');
}

/**
 * Converts HTML template to React component
 * Extracts BOTH head styles AND body content for complete rendering
 */
export function htmlToReactComponent(html: string, options: ConvertOptions = {}): string {
  const { componentName = 'Template', addTailwindStyles = true } = options;
  
  // Parse the HTML
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  // Extract ALL style tags from the document (head and body)
  const styleElements = doc.querySelectorAll('style');
  let allStyles = '';
  styleElements.forEach(style => {
    allStyles += style.innerHTML + '\n';
  });
  
  // Extract body content and its background class
  let bodyContent = doc.body.innerHTML.trim();
  const bodyClass = doc.body.className || 'bg-slate-950 text-white';
  
  // Remove any style tags from body content (we'll inject them separately)
  bodyContent = bodyContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Escape the content for use in template literal
  const escapedContent = bodyContent
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
  
  // Escape styles for template literal
  const escapedStyles = allStyles
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
  
  // Always use dangerouslySetInnerHTML for templates - it's more reliable
  // Include styles in a style tag within the component
  return `import React from 'react';

export default function ${componentName}() {
  const htmlContent = \`${escapedContent}\`;
  
  const templateStyles = \`${escapedStyles}\`;
  
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: templateStyles }} />
      <div 
        className="min-h-screen ${bodyClass}"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </>
  );
}
`;
}

/**
 * Creates a complete VFS file structure from a template
 */
export function templateToVFSFiles(
  templateCode: string, 
  templateName: string = 'Template'
): Record<string, string> {
  const format = detectTemplateFormat(templateCode);
  const files: Record<string, string> = {};
  
  // Sanitize component name
  const componentName = templateName
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^([a-z])/, (m) => m.toUpperCase()) || 'Template';
  
  // Common CSS - works with Tailwind CDN (no @tailwind directives)
  const baseCSS = `:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.75rem;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}

* { border-color: hsl(var(--border)); }

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
`;

  // Common main.tsx - note: no CSS import since Sandpack uses CDN for Tailwind
  const mainTSX = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

  if (format === 'html') {
    // Convert HTML to React component
    const reactComponent = htmlToReactComponent(templateCode, { 
      componentName,
      addTailwindStyles: true 
    });
    
    // Create main App that uses the template (inline to avoid import resolution issues)
    files['/src/App.tsx'] = reactComponent;
    files['/src/main.tsx'] = mainTSX;
    files['/src/index.css'] = baseCSS;

  } else if (format === 'react') {
    // Already React - use directly as App.tsx or detect if it's a component
    if (templateCode.includes('export default function App') || 
        templateCode.includes('export default App') ||
        templateCode.includes('function App()')) {
      files['/src/App.tsx'] = templateCode;
    } else {
      // It's a component - inline it into App.tsx to avoid import issues
      // Remove any export default from the component
      const cleanComponent = templateCode
        .replace(/export\s+default\s+/g, '')
        .replace(/^import.*$/gm, ''); // Remove imports, will add them fresh
      
      // Extract the component/function name
      const funcMatch = cleanComponent.match(/(?:function|const)\s+(\w+)/);
      const extractedName = funcMatch ? funcMatch[1] : componentName;
      
      files['/src/App.tsx'] = `import React from 'react';

${cleanComponent}

export default function App() {
  return <${extractedName} />;
}
`;
    }
    
    files['/src/main.tsx'] = mainTSX;
    files['/src/index.css'] = baseCSS;

  } else {
    // Mixed - treat as JSX snippet to wrap
    files['/src/App.tsx'] = `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      ${templateCode}
    </div>
  );
}
`;
    files['/src/main.tsx'] = mainTSX;
    files['/src/index.css'] = baseCSS;
  }
  
  return files;
}

/**
 * Appends an HTML element to an existing React component
 */
export function appendElementToComponent(
  existingCode: string,
  elementHtml: string,
  elementName: string
): string {
  // Convert the element HTML to JSX
  const jsxElement = htmlToJsx(elementHtml);
  
  // Find the return statement and inject before the closing tag
  const returnMatch = existingCode.match(/return\s*\(\s*([\s\S]*)\s*\);?\s*\}[\s\n]*$/);
  
  if (!returnMatch) {
    // If no return found, wrap the element in a basic component
    return `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      ${jsxElement}
    </div>
  );
}
`;
  }
  
  // Find the last closing div/element before the return closes
  const returnContent = returnMatch[1];
  
  // Find a good injection point - before the last closing </div>
  const lastDivIndex = returnContent.lastIndexOf('</div>');
  if (lastDivIndex > -1) {
    const newContent = 
      returnContent.slice(0, lastDivIndex) + 
      `\n      {/* ${elementName} */}\n      ${jsxElement}\n    ` +
      returnContent.slice(lastDivIndex);
    
    return existingCode.replace(returnMatch[1], newContent);
  }
  
  // Fallback: just append at the end
  return existingCode.replace(
    returnMatch[1],
    returnContent.replace(/(<\/div>\s*)$/, `\n      ${jsxElement}\n    $1`)
  );
}

/**
 * Creates files for a single element insertion
 */
export function elementToVFSPatch(
  existingFiles: Record<string, string>,
  elementHtml: string,
  elementName: string
): Record<string, string> {
  const appContent = existingFiles['/src/App.tsx'] || '';
  
  if (!appContent) {
    // No existing App.tsx - create fresh
    const jsxElement = htmlToJsx(elementHtml);
    return {
      '/src/App.tsx': `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-background p-8">
      {/* ${elementName} */}
      ${jsxElement}
    </div>
  );
}
`
    };
  }
  
  // Append to existing
  return {
    '/src/App.tsx': appendElementToComponent(appContent, elementHtml, elementName)
  };
}
