/**
 * Template to VFS Converter (React-only)
 * 
 * Converts template code into React/TSX VFS file structures.
 * All output is React components — no HTML document generation.
 */

// ============================================================================
// Types
// ============================================================================

interface ConvertOptions {
  componentName?: string;
}

// ============================================================================
// VFS File Structure Generator
// ============================================================================

/**
 * Creates a complete VFS file structure from React component code.
 * Always outputs .tsx files.
 */
export function templateToVFSFiles(
  templateCode: string,
  templateName: string = 'Template'
): Record<string, string> {
  const files: Record<string, string> = {};

  // Sanitize component name
  const componentName = templateName
    .replace(/[^a-zA-Z0-9]/g, '')
    .replace(/^([a-z])/, (m) => m.toUpperCase()) || 'Template';

  const mainTSX = `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;

  const baseCSS = `:root {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --secondary: 217.2 32.6% 17.5%;
  --secondary-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --accent: 217.2 32.6% 17.5%;
  --accent-foreground: 210 40% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 210 40% 98%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 48%;
  --radius: 0.75rem;
}

* { border-color: hsl(var(--border)); }

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
`;

  // Detect if it's already a full React component
  const isFullComponent = templateCode.includes('export default function') ||
    templateCode.includes('export default const') ||
    templateCode.includes('function App()');

  if (isFullComponent) {
    files['/src/App.tsx'] = templateCode;
  } else if (templateCode.includes('import ') || templateCode.includes('export ')) {
    // It's a React component but not the App — wrap it
    const cleanCode = templateCode
      .replace(/export\s+default\s+/g, '')
      .replace(/^import.*$/gm, '');
    const funcMatch = cleanCode.match(/(?:function|const)\s+(\w+)/);
    const extractedName = funcMatch ? funcMatch[1] : componentName;

    files['/src/App.tsx'] = `import React from 'react';

${cleanCode}

export default function App() {
  return <${extractedName} />;
}
`;
  } else {
    // JSX snippet — wrap in App component
    files['/src/App.tsx'] = `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      ${templateCode}
    </div>
  );
}
`;
  }

  files['/src/main.tsx'] = mainTSX;
  files['/src/index.css'] = baseCSS;

  return files;
}

// ============================================================================
// Element Patch — Append JSX to existing component
// ============================================================================

/**
 * Appends a JSX element to an existing React component
 */
export function appendElementToComponent(
  existingCode: string,
  elementJsx: string,
  elementName: string
): string {
  // Find the return statement and inject before the closing tag
  const returnMatch = existingCode.match(/return\s*\(\s*([\s\S]*)\s*\);?\s*\}[\s\n]*$/);

  if (!returnMatch) {
    return `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ${elementName} */}
      ${elementJsx}
    </div>
  );
}
`;
  }

  const returnContent = returnMatch[1];
  const lastDivIndex = returnContent.lastIndexOf('</div>');
  if (lastDivIndex > -1) {
    const newContent =
      returnContent.slice(0, lastDivIndex) +
      `\n      {/* ${elementName} */}\n      ${elementJsx}\n    ` +
      returnContent.slice(lastDivIndex);

    return existingCode.replace(returnMatch[1], newContent);
  }

  return existingCode.replace(
    returnMatch[1],
    returnContent.replace(/(<\/div>\s*)$/, `\n      ${elementJsx}\n    $1`)
  );
}

/**
 * Creates files for a single element insertion
 */
export function elementToVFSPatch(
  existingFiles: Record<string, string>,
  elementJsx: string,
  elementName: string
): Record<string, string> {
  const appContent = existingFiles['/src/App.tsx'] || '';

  if (!appContent) {
    return {
      '/src/App.tsx': `import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      {/* ${elementName} */}
      ${elementJsx}
    </div>
  );
}
`
    };
  }

  return {
    '/src/App.tsx': appendElementToComponent(appContent, elementJsx, elementName)
  };
}
