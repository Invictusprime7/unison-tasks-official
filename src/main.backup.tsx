import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { supabase } from "@/integrations/supabase/client";

// Enhanced error logging
const logError = (error: Error | string, context: string) => {
  const errorInfo = {
    error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    context,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent,
    env: {
      VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'present' : 'missing',
      VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'present' : 'missing'
    }
  };
  console.error(`[${context}]`, errorInfo);
  
  // Try to send to external logging service if available
  try {
    fetch('/api/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorInfo)
    }).catch(() => {/* Ignore if logging endpoint doesn't exist */});
  } catch (e) {
    // Ignore logging errors
  }
};

// Global error handlers
window.addEventListener('error', (event) => {
  logError(event.error || event.message, 'Global Error');
});

window.addEventListener('unhandledrejection', (event) => {
  logError(event.reason, 'Unhandled Promise Rejection');
});

// Test environment variables immediately
console.log('Environment check:', {
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'present' : 'missing',
  VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'present' : 'missing',
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE
});

// Test Supabase connection
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    logError(error.message, 'Supabase Connection Test');
  } else {
    console.log('Supabase connection: OK');
  }
}).catch((error) => {
  logError(error, 'Supabase Connection Failed');
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  const error = new Error("Root element not found - check index.html");
  logError(error, 'DOM Setup');
  throw error;
}

try {
  // Dynamic import to catch module resolution errors
  import('./components/ErrorBoundary').then(({ ErrorBoundary }) => {
    createRoot(rootElement).render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    console.log('React app rendered successfully');
  }).catch((importError) => {
    logError(importError, 'ErrorBoundary Import');
    // Fallback without ErrorBoundary
    createRoot(rootElement).render(<App />);
    console.log('React app rendered successfully (without ErrorBoundary)');
  });
} catch (error) {
  logError(error as Error, 'React Render');
  
  // Fallback error UI
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h1 style="color: red;">Application Error</h1>
      <p>The application failed to start. Please check the browser console for details.</p>
      <p>Error: ${error instanceof Error ? error.message : 'Unknown error'}</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px;">Reload Page</button>
    </div>
  `;
}
