/**
 * UI Template Library - Popular Design Styles
 * Provides reference templates for AI to learn various UI patterns and styles
 */

export interface UITemplate {
  id: string;
  name: string;
  category: 'cyberpunk' | 'gradient' | 'minimal' | 'glassmorphism' | 'neubrutalism';
  description: string;
  tags: string[];
  colorScheme: {
    primary: string[];
    secondary: string[];
    accent: string[];
    background: string[];
    text: string[];
  };
  designPatterns: {
    animations: string[];
    layouts: string[];
    typography: string[];
    effects: string[];
  };
  cssFeatures: string[];
  templateCode: string;
  screenshot?: string;
}

/**
 * Cyberpunk/Neon Style Templates
 */
export const cyberpunkTemplate: UITemplate = {
  id: 'cyberpunk-interface',
  name: 'Cyberpunk Interface',
  category: 'cyberpunk',
  description: 'Futuristic neon-themed interface with glowing effects, animated backgrounds, and terminal-style elements',
  tags: ['neon', 'dark', 'futuristic', 'tech', 'animated', 'glow'],
  colorScheme: {
    primary: ['#00e0ff', '#ae00ff', '#f000ff'],
    secondary: ['#1a002b', '#2a004a', '#3a005a'],
    accent: ['#00e0ff', '#ae00ff', '#f000ff'],
    background: ['#1a002b', '#0d001a', 'radial-gradient(circle at center, #1a002b 0%, #0d001a 100%)'],
    text: ['#e0e0e0', '#ffffff', 'rgba(255, 255, 255, 0.9)']
  },
  designPatterns: {
    animations: [
      'flicker animation for titles',
      'glow-move for background particles',
      'typing animation for terminal output',
      'scanline effect for background',
      'pulsing neon borders'
    ],
    layouts: [
      'sticky header with backdrop blur',
      'grid layout with responsive columns (1/2/3)',
      'card modules with fixed/flexible heights',
      'flexbox button groups',
      'scrollable content areas'
    ],
    typography: [
      'Orbitron for headers (tech/futuristic)',
      'Share Tech Mono for body (monospace)',
      'clamp() for responsive font sizing',
      'text-shadow for neon glow effect'
    ],
    effects: [
      'backdrop-filter: blur for glassmorphism',
      'box-shadow with neon colors',
      'border-image with gradients',
      'animated background particles with blur',
      'transform: translateZ(0) for hardware acceleration',
      'hover transforms with scale and translateY'
    ]
  },
  cssFeatures: [
    'CSS Custom Properties (--neon-blue, --neon-purple, etc.)',
    'CSS Grid for responsive layouts',
    'Flexbox for component alignment',
    '@keyframes for complex animations',
    'clamp() for responsive sizing',
    'backdrop-filter for blur effects',
    '::-webkit-scrollbar styling',
    'position: sticky for header',
    'filter: blur() for glow effects',
    'animation-delay for staggered effects'
  ],
  templateCode: `/* Cyberpunk CSS Pattern */
:root {
  --neon-blue: #00e0ff;
  --neon-purple: #ae00ff;
  --neon-pink: #f000ff;
  --dark-bg: #1a002b;
  --gradient-1: linear-gradient(45deg, var(--neon-blue), var(--neon-purple));
}

body {
  background: radial-gradient(circle at center, var(--dark-bg) 0%, #0d001a 100%);
  font-family: 'Share Tech Mono', monospace;
}

/* Animated glow particles */
body::before {
  content: '';
  position: absolute;
  width: 50vw;
  height: 50vh;
  background: radial-gradient(circle, var(--neon-blue) 0%, transparent 70%);
  filter: blur(100px);
  animation: glow-move 15s infinite alternate ease-in-out;
}

@keyframes glow-move {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(20vw, 15vh) scale(1.1); }
  100% { transform: translate(0, 0) scale(1); }
}

/* Neon text with flicker */
.title {
  font-family: 'Orbitron', sans-serif;
  color: var(--neon-blue);
  text-shadow: 0 0 10px var(--neon-blue), 0 0 20px var(--neon-blue), 0 0 30px var(--neon-blue);
  animation: flicker 1.5s infinite alternate;
}

@keyframes flicker {
  0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { text-shadow: 0 0 10px var(--neon-blue), 0 0 20px var(--neon-blue); }
  20%, 24%, 55% { text-shadow: none; }
}

/* Card with border gradient */
.card {
  background: rgba(26, 0, 43, 0.8);
  border: 2px solid;
  border-image: var(--gradient-1) 1;
  box-shadow: 0 0 15px rgba(0, 224, 255, 0.5), inset 0 0 10px rgba(174, 0, 255, 0.3);
}

/* Terminal output with typing animation */
.terminal {
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid var(--neon-blue);
  animation: typing 4s steps(40, end) forwards;
}

@keyframes typing {
  from { width: 0 }
  to { width: 100% }
}`
};

/**
 * Gradient Mastery Style Templates
 */
export const gradientTemplate: UITemplate = {
  id: 'gradient-mastery',
  name: 'Gradient Mastery',
  category: 'gradient',
  description: 'Vibrant gradient-heavy design with smooth transitions, colorful overlays, and dynamic hover effects',
  tags: ['gradient', 'colorful', 'modern', 'vibrant', 'dynamic', 'smooth'],
  colorScheme: {
    primary: ['#6a11cb', '#2575fc'],
    secondary: ['#fcb045', '#fd1d1d'],
    accent: ['#ff00cc', '#333399'],
    background: ['#1a1a2e', '#0f0a1c', 'linear-gradient(135deg, #1a1a2e, #0f0a1c)'],
    text: ['#f0f0f0', '#333']
  },
  designPatterns: {
    animations: [
      'smooth hover transforms with scale',
      'gradient background transitions',
      'underline animation on hover',
      'box-shadow intensity changes',
      'smooth scroll behavior'
    ],
    layouts: [
      'sticky header with backdrop blur',
      'container-based max-width layouts',
      'flexbox for navigation and groups',
      'responsive grid fallbacks',
      'centered content with auto margins'
    ],
    typography: [
      'Poppins for headers (modern, geometric)',
      'Open Sans for body (readable, versatile)',
      'clamp() for fluid typography',
      'gradient text with background-clip',
      'font-weight variations for hierarchy'
    ],
    effects: [
      'multiple gradient layers',
      'backdrop-filter for glassmorphism',
      'box-shadow variations (light/heavy)',
      'transform: translateY for lift effect',
      'smooth gradient transitions on hover',
      '::after pseudo-elements for underlines'
    ]
  },
  cssFeatures: [
    'CSS Custom Properties for theme management',
    'linear-gradient and radial-gradient',
    'background-clip: text for gradient text',
    '-webkit-text-fill-color: transparent',
    'clamp() for responsive values',
    'backdrop-filter: blur()',
    'transform: scale() and translateY()',
    'transition: all for smooth changes',
    'position: sticky',
    'box-shadow layering'
  ],
  templateCode: `/* Gradient Mastery CSS Pattern */
:root {
  --primary-gradient-start: #6a11cb;
  --primary-gradient-end: #2575fc;
  --secondary-gradient-start: #fcb045;
  --secondary-gradient-end: #fd1d1d;
  --accent-gradient-start: #ff00cc;
  --accent-gradient-end: #333399;
  --box-shadow-light: 0 0.5rem 1rem rgba(0, 0, 0, 0.2);
  --box-shadow-heavy: 0 1rem 3rem rgba(0, 0, 0, 0.35);
  --transition-speed: 0.3s ease-in-out;
}

body {
  background: linear-gradient(135deg, #1a1a2e, #0f0a1c);
  font-family: 'Open Sans', sans-serif;
}

/* Gradient text logo */
.logo {
  background: linear-gradient(90deg, var(--accent-gradient-start), var(--primary-gradient-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Button with gradient background */
.btn-primary {
  background: linear-gradient(45deg, var(--primary-gradient-start), var(--primary-gradient-end));
  box-shadow: var(--box-shadow-light);
  transition: all var(--transition-speed);
}

.btn-primary:hover {
  transform: translateY(-0.25rem) scale(1.02);
  box-shadow: var(--box-shadow-heavy);
  background: linear-gradient(45deg, var(--primary-gradient-end), var(--primary-gradient-start));
}

/* Animated underline on links */
.nav-item a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--secondary-gradient-start), var(--secondary-gradient-end));
  transition: width var(--transition-speed);
}

.nav-item a:hover::after {
  width: 100%;
}

/* Fluid typography */
h1 {
  font-size: clamp(2.5rem, 8vw, 4.5rem);
  font-family: 'Poppins', sans-serif;
}

/* Sticky header with blur */
.header {
  position: sticky;
  top: 0;
  backdrop-filter: blur(10px);
  background: rgba(10, 10, 20, 0.7);
}`
};

/**
 * Extract design patterns from templates for AI learning
 */
export function extractDesignPatterns(template: UITemplate): string {
  return `
Design Style: ${template.name}
Category: ${template.category}
Description: ${template.description}

KEY COLOR PATTERNS:
- Primary Colors: ${template.colorScheme.primary.join(', ')}
- Secondary Colors: ${template.colorScheme.secondary.join(', ')}
- Accent Colors: ${template.colorScheme.accent.join(', ')}
- Background: ${template.colorScheme.background.join(', ')}
- Text Colors: ${template.colorScheme.text.join(', ')}

ANIMATION PATTERNS:
${template.designPatterns.animations.map(a => `- ${a}`).join('\n')}

LAYOUT PATTERNS:
${template.designPatterns.layouts.map(l => `- ${l}`).join('\n')}

TYPOGRAPHY PATTERNS:
${template.designPatterns.typography.map(t => `- ${t}`).join('\n')}

VISUAL EFFECTS:
${template.designPatterns.effects.map(e => `- ${e}`).join('\n')}

CSS TECHNIQUES:
${template.cssFeatures.map(f => `- ${f}`).join('\n')}

IMPLEMENTATION EXAMPLE:
${template.templateCode}
`;
}

/**
 * Get AI prompt enhancement based on template style
 */
export function getStylePromptEnhancement(style: 'cyberpunk' | 'gradient' | 'minimal'): string {
  const templates: Record<string, UITemplate> = {
    cyberpunk: cyberpunkTemplate,
    gradient: gradientTemplate,
  };

  const template = templates[style];
  if (!template) return '';

  return `
Apply ${template.name} design style with these characteristics:

**Color Scheme:**
- Primary: ${template.colorScheme.primary[0]}
- Secondary: ${template.colorScheme.secondary[0]}
- Accent: ${template.colorScheme.accent[0]}
- Background: ${template.colorScheme.background[0]}

**Key Design Elements:**
${template.designPatterns.animations.slice(0, 3).map(a => `- ${a}`).join('\n')}

**Typography:**
${template.designPatterns.typography.slice(0, 2).map(t => `- ${t}`).join('\n')}

**Visual Effects:**
${template.designPatterns.effects.slice(0, 3).map(e => `- ${e}`).join('\n')}
`;
}

/**
 * All available UI templates
 */
export const uiTemplateLibrary: UITemplate[] = [
  cyberpunkTemplate,
  gradientTemplate,
];

/**
 * Get template by ID
 */
export function getTemplateById(id: string): UITemplate | undefined {
  return uiTemplateLibrary.find(t => t.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: UITemplate['category']): UITemplate[] {
  return uiTemplateLibrary.filter(t => t.category === category);
}

/**
 * Get templates by tags
 */
export function getTemplatesByTags(tags: string[]): UITemplate[] {
  return uiTemplateLibrary.filter(t => 
    tags.some(tag => t.tags.includes(tag.toLowerCase()))
  );
}

/**
 * Generate AI training data from all templates
 */
export function generateAITrainingData(): string {
  return uiTemplateLibrary.map(template => extractDesignPatterns(template)).join('\n\n---\n\n');
}
