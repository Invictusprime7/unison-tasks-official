/**
 * Utility to sanitize CSS class names and prevent DOMTokenList errors
 */

/**
 * Sanitizes a class name to ensure it's valid for DOMTokenList.add()
 * - Removes whitespace and invalid characters
 * - Prevents empty strings
 * - Ensures it starts with a letter or underscore
 */
export function sanitizeClassName(className: string): string {
  if (!className || typeof className !== 'string') {
    return '';
  }

  // Remove leading/trailing whitespace and collapse internal whitespace
  const cleaned = className.trim().replace(/\s+/g, '-');
  
  // Remove invalid characters (keep only alphanumeric, hyphens, underscores)
  const sanitized = cleaned.replace(/[^a-zA-Z0-9_-]/g, '');
  
  // Ensure it starts with a letter or underscore (not a number or hyphen)
  if (sanitized && /^[0-9-]/.test(sanitized)) {
    return 'class-' + sanitized;
  }
  
  return sanitized || 'fallback-class';
}

/**
 * Sanitizes multiple class names (space-separated string)
 */
export function sanitizeClassNames(classNames: string): string {
  if (!classNames || typeof classNames !== 'string') {
    return '';
  }

  return classNames
    .split(/\s+/)
    .map(sanitizeClassName)
    .filter(Boolean)
    .join(' ');
}

/**
 * Safely adds class names to an element, preventing DOMTokenList errors
 */
export function safeAddClasses(element: Element, classNames: string): void {
  if (!element || !classNames) return;

  const sanitizedClasses = sanitizeClassNames(classNames);
  if (!sanitizedClasses) return;

  try {
    // Split and add each class individually to handle edge cases
    sanitizedClasses.split(/\s+/).forEach(className => {
      if (className && !element.classList.contains(className)) {
        element.classList.add(className);
      }
    });
  } catch (error) {
    console.warn('Failed to add classes:', classNames, 'Error:', error);
    // Fallback: set className directly with sanitized value
    const existingClasses = element.className ? element.className.split(/\s+/) : [];
    const newClasses = sanitizedClasses.split(/\s+/);
    const combinedClasses = [...new Set([...existingClasses, ...newClasses])];
    element.className = combinedClasses.join(' ');
  }
}

/**
 * Sanitizes HTML content to fix potential class name issues
 */
export function sanitizeHTMLClasses(html: string): string {
  if (!html || typeof html !== 'string') {
    return html;
  }

  // Replace class attributes with sanitized versions
  return html.replace(/class\s*=\s*["']([^"']*)["']/gi, (match, classNames) => {
    const sanitized = sanitizeClassNames(classNames);
    const quote = match.includes('"') ? '"' : "'";
    return `class=${quote}${sanitized}${quote}`;
  });
}