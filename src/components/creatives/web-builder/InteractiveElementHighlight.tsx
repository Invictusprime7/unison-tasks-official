/**
 * Interactive Element Highlight
 * Visual highlight for elements in interactive/preview mode
 */

import React, { useEffect, useState } from 'react';

interface InteractiveElementHighlightProps {
  element: HTMLElement | null;
}

export const InteractiveElementHighlight: React.FC<InteractiveElementHighlightProps> = ({
  element
}) => {
  const [bounds, setBounds] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (element) {
      const rect = element.getBoundingClientRect();
      setBounds(rect);
    } else {
      setBounds(null);
    }
  }, [element]);

  if (!bounds) return null;

  return (
    <div
      className="pointer-events-none fixed border-2 border-blue-500 bg-blue-500/10 transition-all duration-150"
      style={{
        left: `${bounds.left}px`,
        top: `${bounds.top}px`,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
        zIndex: 9998
      }}
    />
  );
};
