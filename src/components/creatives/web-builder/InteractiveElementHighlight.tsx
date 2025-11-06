import React from 'react';
import { cn } from '@/lib/utils';

interface InteractiveElementHighlightProps {
  isInteractiveMode: boolean;
  className?: string;
}

export const InteractiveElementHighlight: React.FC<InteractiveElementHighlightProps> = ({
  isInteractiveMode,
  className
}) => {
  if (!isInteractiveMode) return null;

  return (
    <style>
      {`
        /* Interactive Mode Highlighting Styles */
        iframe[title="Live Preview"] {
          position: relative;
        }
        
        /* Highlight interactive elements in interactive mode */
        .interactive-mode button,
        .interactive-mode a[href],
        .interactive-mode [onclick],
        .interactive-mode [role="button"],
        .interactive-mode input[type="submit"],
        .interactive-mode input[type="button"] {
          position: relative !important;
          cursor: pointer !important;
        }
        
        .interactive-mode button:before,
        .interactive-mode a[href]:before,
        .interactive-mode [onclick]:before,
        .interactive-mode [role="button"]:before,
        .interactive-mode input[type="submit"]:before,
        .interactive-mode input[type="button"]:before {
          content: '👆';
          position: absolute;
          top: -20px;
          right: -10px;
          font-size: 12px;
          z-index: 1000;
          background: rgba(34, 197, 94, 0.9);
          color: white;
          padding: 2px 4px;
          border-radius: 4px;
          font-family: system-ui;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.2s ease;
          pointer-events: none;
        }
        
        .interactive-mode button:hover:before,
        .interactive-mode a[href]:hover:before,
        .interactive-mode [onclick]:hover:before,
        .interactive-mode [role="button"]:hover:before,
        .interactive-mode input[type="submit"]:hover:before,
        .interactive-mode input[type="button"]:hover:before {
          opacity: 1;
          transform: scale(1);
        }
        
        /* Subtle glow for interactive elements */
        .interactive-mode button:hover,
        .interactive-mode a[href]:hover,
        .interactive-mode [onclick]:hover,
        .interactive-mode [role="button"]:hover {
          box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.3) !important;
          outline: none !important;
        }
        
        /* Pulse animation for primary CTAs */
        .interactive-mode .btn-primary,
        .interactive-mode .cta-button,
        .interactive-mode [class*="primary"],
        .interactive-mode [class*="cta"] {
          animation: gentle-pulse 2s infinite;
        }
        
        @keyframes gentle-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        /* Edit mode overlay styles for non-interactive elements */
        .edit-mode *:hover {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
        }
        
        .edit-mode *:hover:before {
          content: '✏️ Edit';
          position: absolute;
          top: -25px;
          left: 0;
          background: rgba(59, 130, 246, 0.9);
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-family: system-ui;
          z-index: 1000;
          pointer-events: none;
        }
      `}
    </style>
  );
};