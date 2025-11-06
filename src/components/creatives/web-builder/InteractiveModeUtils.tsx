import React from 'react';
import { toast } from 'sonner';

interface InteractiveModeUtilsProps {
  isInteractiveMode: boolean;
}

export const InteractiveModeUtils: React.FC<InteractiveModeUtilsProps> = ({
  isInteractiveMode
}) => {
  React.useEffect(() => {
    if (!isInteractiveMode) return;

    // Add global styles for interactive mode
    const style = document.createElement('style');
    style.id = 'interactive-mode-utils';
    style.textContent = `
      /* Global interactive mode enhancements */
      .interactive-mode-active {
        --interactive-primary: #22c55e;
        --interactive-secondary: #3b82f6;
        --interactive-accent: #f59e0b;
      }
      
      /* Smooth transitions for all interactive elements */
      .interactive-mode-active button,
      .interactive-mode-active a[href],
      .interactive-mode-active [role="button"],
      .interactive-mode-active [onclick] {
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        cursor: pointer !important;
      }
      
      /* Enhanced hover states */
      .interactive-mode-active button:hover,
      .interactive-mode-active a[href]:hover,
      .interactive-mode-active [role="button"]:hover,
      .interactive-mode-active [onclick]:hover {
        transform: translateY(-1px) scale(1.02) !important;
        filter: brightness(1.1) !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
      }
      
      /* Active/click states */
      .interactive-mode-active button:active,
      .interactive-mode-active a[href]:active,
      .interactive-mode-active [role="button"]:active,
      .interactive-mode-active [onclick]:active {
        transform: translateY(0) scale(0.98) !important;
        transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
      
      /* Disable text selection during interactive mode */
      .interactive-mode-active {
        user-select: none !important;
      }
      
      /* Re-enable text selection for input fields */
      .interactive-mode-active input,
      .interactive-mode-active textarea,
      .interactive-mode-active [contenteditable] {
        user-select: text !important;
      }
      
      /* Interactive mode cursor hints */
      .interactive-mode-active body {
        cursor: default !important;
      }
      
      /* Success feedback animation */
      @keyframes interactive-success {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      .interactive-feedback {
        animation: interactive-success 0.3s ease-out !important;
      }
    `;
    
    document.head.appendChild(style);
    document.body.classList.add('interactive-mode-active');

    // Enhanced click feedback for all interactive elements
    const handleInteractiveClick = (e: Event) => {
      const target = e.target as HTMLElement;
      
      // Check if it's an interactive element
      const isInteractive = target.matches('button, a[href], [role="button"], [onclick], input[type="submit"], input[type="button"]') ||
                           target.closest('button, a[href], [role="button"], [onclick]');
      
      if (isInteractive) {
        // Add visual feedback
        target.classList.add('interactive-feedback');
        setTimeout(() => target.classList.remove('interactive-feedback'), 300);
        
        // Show toast for CTA clicks
        const text = target.textContent?.trim() || target.getAttribute('aria-label') || target.tagName;
        if (text && text.length > 0) {
          toast.success(`🎯 Clicked: ${text}`, {
            duration: 2000,
            description: 'Interactive element activated!',
          });
        }
        
        // Log interaction for analytics
        console.log('[Interactive Mode] Element clicked:', {
          tag: target.tagName,
          text: text,
          classes: target.className,
          href: target.getAttribute('href'),
          type: target.getAttribute('type')
        });
      }
    };

    // Add event listener with capture to ensure we catch all clicks
    document.addEventListener('click', handleInteractiveClick, true);

    return () => {
      // Cleanup
      document.head.removeChild(style);
      document.body.classList.remove('interactive-mode-active');
      document.removeEventListener('click', handleInteractiveClick, true);
    };
  }, [isInteractiveMode]);

  return null; // This component only adds global effects
};