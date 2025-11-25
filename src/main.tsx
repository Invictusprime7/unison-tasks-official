import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Add global error handler with visual feedback
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  showErrorUI('Application Error', event.error?.message || 'Unknown error');
  event.preventDefault();
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showErrorUI('Promise Rejection', event.reason?.message || String(event.reason));
  event.preventDefault();
});

function showErrorUI(title: string, message: string) {
  const root = document.getElementById("root");
  if (root && !root.querySelector('.error-display')) {
    root.innerHTML = `
      <div class="error-display" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #0f172a; color: white; font-family: system-ui;">
        <div style="max-width: 600px; padding: 2rem; background: #1e293b; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
          <h1 style="color: #ef4444; margin-bottom: 1rem;">${title}</h1>
          <p style="margin-bottom: 1rem; color: #94a3b8;">${message}</p>
          <p style="color: #64748b; font-size: 0.875rem;">Check the browser console for more details.</p>
          <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  console.log('Initializing React app...');
  console.log('Environment check:', {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'present' : 'missing',
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'present' : 'missing'
  });
  
  createRoot(rootElement).render(<App />);
  console.log('React app rendered successfully');
} catch (error) {
  console.error('Failed to render app:', error);
  showErrorUI('Render Error', error instanceof Error ? error.message : 'Failed to initialize application');
}
