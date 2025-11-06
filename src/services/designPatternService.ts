/**
 * Design Pattern Service
 * Intelligently detects and applies neomorphic, cyberpunk, and gradient design patterns
 */

export type DesignPattern = 'neomorphic' | 'cyberpunk' | 'gradient' | 'glassmorphism' | 'minimal' | 'modern';

export interface DesignPatternStyles {
  pattern: DesignPattern;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  shadows: {
    light: string;
    dark: string;
    glow: string;
  };
  effects: {
    blur: string;
    opacity: string;
    border: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

/**
 * Detects design patterns from user prompts
 */
export function detectDesignPattern(prompt: string): DesignPattern | null {
  const lowerPrompt = prompt.toLowerCase();
  
  // Pattern detection keywords
  const patterns: Record<DesignPattern, string[]> = {
    neomorphic: [
      'neomorphic', 'neomorphism', 'neumorphic', 'neumorphism',
      'soft ui', 'soft shadow', 'embossed', 'raised', 'inset',
      'subtle shadow', 'tactile', 'soft design'
    ],
    cyberpunk: [
      'cyberpunk', 'neon', 'futuristic', 'cyber', 'sci-fi',
      'matrix', 'tech', 'glow', 'electric', 'digital',
      'holographic', 'terminal', 'hacker', 'dystopian'
    ],
    gradient: [
      'gradient', 'gradients', 'color blend', 'fade',
      'rainbow', 'spectrum', 'mesh gradient', 'color transition',
      'vibrant', 'colorful', 'multi-color'
    ],
    glassmorphism: [
      'glassmorphism', 'glass', 'frosted', 'translucent',
      'transparent', 'blur', 'backdrop blur', 'acrylic'
    ],
    minimal: [
      'minimal', 'minimalist', 'simple', 'clean',
      'basic', 'plain', 'stripped down'
    ],
    modern: [
      'modern', 'contemporary', 'sleek', 'professional',
      'business', 'corporate', 'elegant'
    ]
  };
  
  // Check each pattern
  for (const [pattern, keywords] of Object.entries(patterns)) {
    if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
      return pattern as DesignPattern;
    }
  }
  
  return null;
}

/**
 * Generate neomorphic design styles
 */
export function getNeomorphicStyles(): DesignPatternStyles {
  return {
    pattern: 'neomorphic',
    colors: {
      primary: '#e0e5ec',
      secondary: '#d1d9e6',
      accent: '#a0b0c5',
      background: '#e0e5ec',
      surface: '#e0e5ec',
      text: '#4a5568',
      textSecondary: '#718096',
    },
    shadows: {
      light: '8px 8px 16px #b8bec7, -8px -8px 16px #ffffff',
      dark: 'inset 8px 8px 16px #b8bec7, inset -8px -8px 16px #ffffff',
      glow: '0 0 20px rgba(160, 176, 197, 0.3)',
    },
    effects: {
      blur: '0px',
      opacity: '1',
      border: '1px solid rgba(255, 255, 255, 0.1)',
    },
    gradients: {
      primary: 'linear-gradient(145deg, #e6ebf1, #c9d1db)',
      secondary: 'linear-gradient(145deg, #d1d9e6, #b8c0cd)',
      accent: 'linear-gradient(145deg, #a0b0c5, #8a9ab0)',
    },
  };
}

/**
 * Generate cyberpunk design styles
 */
export function getCyberpunkStyles(): DesignPatternStyles {
  return {
    pattern: 'cyberpunk',
    colors: {
      primary: '#00ffff',
      secondary: '#ff00ff',
      accent: '#ffff00',
      background: '#0a0e27',
      surface: '#1a1f3a',
      text: '#00ffff',
      textSecondary: '#ff00ff',
    },
    shadows: {
      light: '0 0 20px rgba(0, 255, 255, 0.5)',
      dark: '0 0 40px rgba(255, 0, 255, 0.5)',
      glow: '0 0 30px currentColor, 0 0 60px currentColor, 0 0 90px currentColor',
    },
    effects: {
      blur: '0px',
      opacity: '0.9',
      border: '1px solid currentColor',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #00ffff 0%, #0080ff 100%)',
      secondary: 'linear-gradient(135deg, #ff00ff 0%, #ff0080 100%)',
      accent: 'linear-gradient(135deg, #ffff00 0%, #ff8000 100%)',
    },
  };
}

/**
 * Generate gradient design styles
 */
export function getGradientStyles(): DesignPatternStyles {
  return {
    pattern: 'gradient',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      accent: '#f093fb',
      background: '#ffffff',
      surface: '#f7fafc',
      text: '#2d3748',
      textSecondary: '#718096',
    },
    shadows: {
      light: '0 10px 25px rgba(102, 126, 234, 0.2)',
      dark: '0 20px 40px rgba(118, 75, 162, 0.3)',
      glow: '0 0 40px rgba(240, 147, 251, 0.4)',
    },
    effects: {
      blur: '0px',
      opacity: '1',
      border: '1px solid transparent',
    },
    gradients: {
      primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      accent: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    },
  };
}

/**
 * Generate glassmorphism design styles
 */
export function getGlassmorphismStyles(): DesignPatternStyles {
  return {
    pattern: 'glassmorphism',
    colors: {
      primary: '#ffffff',
      secondary: '#f0f0f0',
      accent: '#3b82f6',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      surface: 'rgba(255, 255, 255, 0.1)',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.7)',
    },
    shadows: {
      light: '0 8px 32px rgba(31, 38, 135, 0.15)',
      dark: '0 8px 32px rgba(0, 0, 0, 0.25)',
      glow: '0 0 20px rgba(255, 255, 255, 0.2)',
    },
    effects: {
      blur: '10px',
      opacity: '0.1',
      border: '1px solid rgba(255, 255, 255, 0.18)',
    },
    gradients: {
      primary: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
      secondary: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
      accent: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 51, 234, 0.3) 100%)',
    },
  };
}

/**
 * Get styles for detected pattern
 */
export function getPatternStyles(pattern: DesignPattern): DesignPatternStyles {
  switch (pattern) {
    case 'neomorphic':
      return getNeomorphicStyles();
    case 'cyberpunk':
      return getCyberpunkStyles();
    case 'gradient':
      return getGradientStyles();
    case 'glassmorphism':
      return getGlassmorphismStyles();
    case 'minimal':
      return {
        pattern: 'minimal',
        colors: {
          primary: '#000000',
          secondary: '#333333',
          accent: '#666666',
          background: '#ffffff',
          surface: '#fafafa',
          text: '#000000',
          textSecondary: '#666666',
        },
        shadows: {
          light: '0 1px 3px rgba(0, 0, 0, 0.12)',
          dark: '0 2px 6px rgba(0, 0, 0, 0.16)',
          glow: 'none',
        },
        effects: {
          blur: '0px',
          opacity: '1',
          border: '1px solid #e5e5e5',
        },
        gradients: {
          primary: 'linear-gradient(to bottom, #ffffff 0%, #f5f5f5 100%)',
          secondary: 'linear-gradient(to bottom, #f5f5f5 0%, #e5e5e5 100%)',
          accent: 'linear-gradient(to bottom, #e5e5e5 0%, #d5d5d5 100%)',
        },
      };
    case 'modern':
      return {
        pattern: 'modern',
        colors: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#06b6d4',
          background: '#ffffff',
          surface: '#f9fafb',
          text: '#111827',
          textSecondary: '#6b7280',
        },
        shadows: {
          light: '0 4px 6px rgba(0, 0, 0, 0.07)',
          dark: '0 10px 15px rgba(0, 0, 0, 0.1)',
          glow: '0 0 15px rgba(59, 130, 246, 0.3)',
        },
        effects: {
          blur: '0px',
          opacity: '1',
          border: '1px solid #e5e7eb',
        },
        gradients: {
          primary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          secondary: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          accent: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
        },
      };
    default:
      return getGradientStyles(); // Default fallback
  }
}

/**
 * Generate CSS classes for a pattern
 */
export function generatePatternCSS(styles: DesignPatternStyles): string {
  const { pattern, colors, shadows, effects, gradients } = styles;
  
  let css = `/* ${pattern.toUpperCase()} Design Pattern */\n\n`;
  
  // Base classes
  css += `.${pattern}-container {\n`;
  css += `  background: ${colors.background};\n`;
  css += `  color: ${colors.text};\n`;
  if (effects.blur !== '0px') {
    css += `  backdrop-filter: blur(${effects.blur});\n`;
  }
  css += `}\n\n`;
  
  // Card/Surface
  css += `.${pattern}-card {\n`;
  css += `  background: ${colors.surface};\n`;
  css += `  border: ${effects.border};\n`;
  css += `  border-radius: 12px;\n`;
  css += `  padding: 24px;\n`;
  css += `  box-shadow: ${shadows.light};\n`;
  if (effects.blur !== '0px') {
    css += `  backdrop-filter: blur(${effects.blur});\n`;
  }
  css += `  transition: all 0.3s ease;\n`;
  css += `}\n\n`;
  
  css += `.${pattern}-card:hover {\n`;
  css += `  box-shadow: ${shadows.dark};\n`;
  if (shadows.glow !== 'none') {
    css += `  box-shadow: ${shadows.dark}, ${shadows.glow};\n`;
  }
  css += `  transform: translateY(-2px);\n`;
  css += `}\n\n`;
  
  // Button
  css += `.${pattern}-button {\n`;
  css += `  background: ${gradients.primary};\n`;
  css += `  color: ${pattern === 'neomorphic' ? colors.text : colors.primary};\n`;
  css += `  border: ${effects.border};\n`;
  css += `  border-radius: 8px;\n`;
  css += `  padding: 12px 24px;\n`;
  css += `  font-weight: 600;\n`;
  css += `  cursor: pointer;\n`;
  css += `  box-shadow: ${shadows.light};\n`;
  css += `  transition: all 0.3s ease;\n`;
  css += `}\n\n`;
  
  css += `.${pattern}-button:hover {\n`;
  css += `  box-shadow: ${shadows.dark};\n`;
  if (shadows.glow !== 'none') {
    css += `  box-shadow: ${shadows.dark}, ${shadows.glow};\n`;
  }
  css += `  transform: translateY(-2px);\n`;
  css += `}\n\n`;
  
  // Input
  css += `.${pattern}-input {\n`;
  if (pattern === 'neomorphic') {
    css += `  background: ${colors.surface};\n`;
    css += `  box-shadow: ${shadows.dark};\n`;
  } else {
    css += `  background: ${colors.surface};\n`;
    css += `  box-shadow: ${shadows.light};\n`;
  }
  css += `  border: ${effects.border};\n`;
  css += `  border-radius: 8px;\n`;
  css += `  padding: 12px 16px;\n`;
  css += `  color: ${colors.text};\n`;
  if (effects.blur !== '0px') {
    css += `  backdrop-filter: blur(${effects.blur});\n`;
  }
  css += `  transition: all 0.3s ease;\n`;
  css += `}\n\n`;
  
  css += `.${pattern}-input:focus {\n`;
  css += `  outline: none;\n`;
  css += `  border-color: ${colors.accent};\n`;
  if (shadows.glow !== 'none') {
    css += `  box-shadow: ${shadows.glow};\n`;
  }
  css += `}\n\n`;
  
  return css;
}

/**
 * Generate component code with pattern applied
 */
export function generateComponentWithPattern(
  componentType: string,
  pattern: DesignPattern,
  description: string
): string {
  const styles = getPatternStyles(pattern);
  const patternName = pattern.charAt(0).toUpperCase() + pattern.slice(1);
  
  let code = `// ${patternName} ${componentType}\n`;
  code += `// ${description}\n\n`;
  code += `import React from 'react';\n\n`;
  code += `const ${patternName}${componentType}: React.FC = () => {\n`;
  code += `  return (\n`;
  
  // Generate component structure based on type
  if (componentType.toLowerCase().includes('card')) {
    code += `    <div className="${pattern}-card" style={{\n`;
    code += `      background: '${styles.colors.surface}',\n`;
    code += `      boxShadow: '${styles.shadows.light}',\n`;
    code += `      border: '${styles.effects.border}',\n`;
    code += `      borderRadius: '12px',\n`;
    code += `      padding: '24px',\n`;
    if (styles.effects.blur !== '0px') {
      code += `      backdropFilter: 'blur(${styles.effects.blur})',\n`;
    }
    code += `    }}>\n`;
    code += `      <h3 style={{ color: '${styles.colors.text}', marginBottom: '16px' }}>Card Title</h3>\n`;
    code += `      <p style={{ color: '${styles.colors.textSecondary}' }}>\n`;
    code += `        This is a ${pattern} styled card component with beautiful design.\n`;
    code += `      </p>\n`;
    code += `      <button className="${pattern}-button" style={{\n`;
    code += `        background: '${styles.gradients.primary}',\n`;
    code += `        border: '${styles.effects.border}',\n`;
    code += `        borderRadius: '8px',\n`;
    code += `        padding: '12px 24px',\n`;
    code += `        marginTop: '16px',\n`;
    code += `        cursor: 'pointer',\n`;
    code += `      }}>Action</button>\n`;
    code += `    </div>\n`;
  } else if (componentType.toLowerCase().includes('button')) {
    code += `    <button className="${pattern}-button" style={{\n`;
    code += `      background: '${styles.gradients.primary}',\n`;
    code += `      color: '${pattern === 'neomorphic' ? styles.colors.text : '#ffffff'}',\n`;
    code += `      border: '${styles.effects.border}',\n`;
    code += `      borderRadius: '8px',\n`;
    code += `      padding: '12px 24px',\n`;
    code += `      fontWeight: '600',\n`;
    code += `      cursor: 'pointer',\n`;
    code += `      boxShadow: '${styles.shadows.light}',\n`;
    code += `    }}>\n`;
    code += `      Click Me\n`;
    code += `    </button>\n`;
  } else {
    code += `    <div className="${pattern}-container" style={{\n`;
    code += `      background: '${styles.colors.background}',\n`;
    code += `      color: '${styles.colors.text}',\n`;
    code += `      padding: '32px',\n`;
    code += `      borderRadius: '16px',\n`;
    if (styles.effects.blur !== '0px') {
      code += `      backdropFilter: 'blur(${styles.effects.blur})',\n`;
    }
    code += `    }}>\n`;
    code += `      <h2 style={{ \n`;
    code += `        background: '${styles.gradients.primary}',\n`;
    code += `        backgroundClip: 'text',\n`;
    code += `        WebkitBackgroundClip: 'text',\n`;
    code += `        WebkitTextFillColor: 'transparent',\n`;
    code += `        marginBottom: '16px'\n`;
    code += `      }}>${patternName} Component</h2>\n`;
    code += `      <p style={{ color: '${styles.colors.textSecondary}' }}>\n`;
    code += `        ${description}\n`;
    code += `      </p>\n`;
    code += `    </div>\n`;
  }
  
  code += `  );\n`;
  code += `};\n\n`;
  code += `export default ${patternName}${componentType};\n\n`;
  code += `/* CSS Styles */\n`;
  code += generatePatternCSS(styles);
  
  return code;
}

/**
 * Enhance user prompt with pattern context for AI
 */
export function enhancePromptWithPattern(prompt: string, pattern: DesignPattern): string {
  const styles = getPatternStyles(pattern);
  const patternName = pattern.charAt(0).toUpperCase() + pattern.slice(1);
  
  let enhancedPrompt = `${prompt}\n\n`;
  enhancedPrompt += `IMPORTANT: Apply ${patternName} design pattern with these specifications:\n\n`;
  enhancedPrompt += `Colors:\n`;
  enhancedPrompt += `- Primary: ${styles.colors.primary}\n`;
  enhancedPrompt += `- Secondary: ${styles.colors.secondary}\n`;
  enhancedPrompt += `- Accent: ${styles.colors.accent}\n`;
  enhancedPrompt += `- Background: ${styles.colors.background}\n`;
  enhancedPrompt += `- Text: ${styles.colors.text}\n\n`;
  
  enhancedPrompt += `Shadows:\n`;
  enhancedPrompt += `- Light: ${styles.shadows.light}\n`;
  enhancedPrompt += `- Dark: ${styles.shadows.dark}\n`;
  if (styles.shadows.glow !== 'none') {
    enhancedPrompt += `- Glow: ${styles.shadows.glow}\n`;
  }
  enhancedPrompt += `\n`;
  
  enhancedPrompt += `Effects:\n`;
  if (styles.effects.blur !== '0px') {
    enhancedPrompt += `- Backdrop Blur: ${styles.effects.blur}\n`;
  }
  enhancedPrompt += `- Border: ${styles.effects.border}\n\n`;
  
  enhancedPrompt += `Gradients:\n`;
  enhancedPrompt += `- Primary: ${styles.gradients.primary}\n`;
  enhancedPrompt += `- Secondary: ${styles.gradients.secondary}\n`;
  enhancedPrompt += `- Accent: ${styles.gradients.accent}\n\n`;
  
  // Add pattern-specific guidelines
  switch (pattern) {
    case 'neomorphic':
      enhancedPrompt += `Neomorphic Guidelines:\n`;
      enhancedPrompt += `- Use subtle, soft shadows for depth\n`;
      enhancedPrompt += `- Create raised and inset effects\n`;
      enhancedPrompt += `- Keep borders minimal or none\n`;
      enhancedPrompt += `- Use monochromatic color schemes\n`;
      enhancedPrompt += `- Elements should appear to extrude from the background\n`;
      break;
    case 'cyberpunk':
      enhancedPrompt += `Cyberpunk Guidelines:\n`;
      enhancedPrompt += `- Use bright neon colors (cyan, magenta, yellow)\n`;
      enhancedPrompt += `- Apply strong glow effects\n`;
      enhancedPrompt += `- Dark, high-contrast backgrounds\n`;
      enhancedPrompt += `- Sharp, angular shapes\n`;
      enhancedPrompt += `- Technology/sci-fi aesthetic\n`;
      break;
    case 'gradient':
      enhancedPrompt += `Gradient Guidelines:\n`;
      enhancedPrompt += `- Use smooth color transitions\n`;
      enhancedPrompt += `- Apply gradients to backgrounds and text\n`;
      enhancedPrompt += `- Create depth with layered gradients\n`;
      enhancedPrompt += `- Vibrant, eye-catching colors\n`;
      enhancedPrompt += `- Modern, dynamic appearance\n`;
      break;
    case 'glassmorphism':
      enhancedPrompt += `Glassmorphism Guidelines:\n`;
      enhancedPrompt += `- Use backdrop blur for frosted glass effect\n`;
      enhancedPrompt += `- Semi-transparent backgrounds\n`;
      enhancedPrompt += `- Subtle borders with transparency\n`;
      enhancedPrompt += `- Layered depth with blur\n`;
      enhancedPrompt += `- Light, airy appearance\n`;
      break;
  }
  
  return enhancedPrompt;
}
