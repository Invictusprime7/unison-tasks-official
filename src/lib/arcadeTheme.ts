/**
 * Arcade Theme Utility Classes
 * 
 * Consistent arcade/neon design system used across Unison Tasks.
 * Based on the WebBuilder arcade aesthetic.
 */

import { cn } from "./utils";

// ============================================
// ARCADE THEME BACKGROUND COLORS
// ============================================
export const arcadeColors = {
  // Base dark backgrounds
  bg: {
    deep: "bg-[#0a0a12]",      // Deepest background
    dark: "bg-[#0d0d18]",      // Standard dark
    subtle: "bg-[#0a0a14]",    // Subtle variation
    card: "bg-[#12121e]",      // Card backgrounds
    hover: "bg-[#16162a]",     // Hover state
  },
  // Neon accent colors
  neon: {
    yellow: "text-yellow-400",
    cyan: "text-cyan-400",
    lime: "text-lime-400",
    fuchsia: "text-fuchsia-400",
    purple: "text-purple-400",
    red: "text-red-400",
    blue: "text-blue-400",
    orange: "text-orange-400",
  }
} as const;

// ============================================
// ARCADE GLOW SHADOWS
// ============================================
export const arcadeGlows = {
  yellow: "shadow-[0_0_15px_rgba(255,255,0,0.15)]",
  yellowHover: "hover:shadow-[0_0_20px_rgba(255,255,0,0.4)]",
  yellowActive: "shadow-[0_0_20px_rgba(255,255,0,0.6)]",
  
  cyan: "shadow-[0_0_15px_rgba(0,255,255,0.15)]",
  cyanHover: "hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]",
  cyanActive: "shadow-[0_0_20px_rgba(0,255,255,0.6)]",
  
  lime: "shadow-[0_0_15px_rgba(0,255,0,0.15)]",
  limeHover: "hover:shadow-[0_0_20px_rgba(0,255,0,0.4)]",
  limeActive: "shadow-[0_0_20px_rgba(0,255,0,0.6)]",
  
  fuchsia: "shadow-[0_0_15px_rgba(255,0,255,0.15)]",
  fuchsiaHover: "hover:shadow-[0_0_20px_rgba(255,0,255,0.4)]",
  fuchsiaActive: "shadow-[0_0_20px_rgba(255,0,255,0.6)]",
  
  purple: "shadow-[0_0_15px_rgba(168,85,247,0.15)]",
  purpleHover: "hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]",
  purpleActive: "shadow-[0_0_20px_rgba(168,85,247,0.6)]",
  
  red: "shadow-[0_0_15px_rgba(255,0,0,0.15)]",
  redHover: "hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]",
  redActive: "shadow-[0_0_20px_rgba(255,0,0,0.6)]",

  blue: "shadow-[0_0_15px_rgba(59,130,246,0.15)]",
  blueHover: "hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]",
  blueActive: "shadow-[0_0_20px_rgba(59,130,246,0.6)]",

  panel: "shadow-[0_0_30px_rgba(0,255,255,0.2)]",
} as const;

// Text glow effects
export const arcadeTextGlow = {
  yellow: "drop-shadow-[0_0_5px_rgba(255,255,0,0.5)]",
  cyan: "drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]",
  lime: "drop-shadow-[0_0_5px_rgba(0,255,0,0.5)]",
  fuchsia: "drop-shadow-[0_0_5px_rgba(255,0,255,0.5)]",
  purple: "drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]",
} as const;

// ============================================
// ARCADE COMPONENT STYLES
// ============================================

/** Arcade-styled page container */
export const arcadePageContainer = cn(
  "min-h-screen bg-[#0a0a12]"
);

/** Arcade-styled header */
export const arcadeHeader = cn(
  "bg-[#0d0d18]/95 backdrop-blur-sm border-b border-cyan-500/20",
  "shadow-[0_4px_20px_rgba(0,255,255,0.1)]"
);

/** Arcade-styled card */
export const arcadeCard = cn(
  "bg-[#12121e] border border-cyan-500/20 rounded-xl",
  "shadow-[0_0_20px_rgba(0,255,255,0.08)]",
  "hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(0,255,255,0.15)]",
  "transition-all duration-300"
);

/** Arcade-styled card with yellow accent */
export const arcadeCardYellow = cn(
  "bg-[#12121e] border border-yellow-500/20 rounded-xl",
  "shadow-[0_0_20px_rgba(255,255,0,0.08)]",
  "hover:border-yellow-500/40 hover:shadow-[0_0_30px_rgba(255,255,0,0.15)]",
  "transition-all duration-300"
);

/** Arcade-styled card with lime accent */
export const arcadeCardLime = cn(
  "bg-[#12121e] border border-lime-500/20 rounded-xl",
  "shadow-[0_0_20px_rgba(0,255,0,0.08)]",
  "hover:border-lime-500/40 hover:shadow-[0_0_30px_rgba(0,255,0,0.15)]",
  "transition-all duration-300"
);

/** Arcade-styled card with fuchsia accent */
export const arcadeCardFuchsia = cn(
  "bg-[#12121e] border border-fuchsia-500/20 rounded-xl",
  "shadow-[0_0_20px_rgba(255,0,255,0.08)]",
  "hover:border-fuchsia-500/40 hover:shadow-[0_0_30px_rgba(255,0,255,0.15)]",
  "transition-all duration-300"
);

/** Arcade-styled card with purple accent */
export const arcadeCardPurple = cn(
  "bg-[#12121e] border border-purple-500/20 rounded-xl",
  "shadow-[0_0_20px_rgba(168,85,247,0.08)]",
  "hover:border-purple-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]",
  "transition-all duration-300"
);

/** Arcade-styled panel container */
export const arcadePanel = cn(
  "bg-[#0d0d18] rounded-xl border border-cyan-500/20",
  "shadow-[0_0_30px_rgba(0,255,255,0.15)]"
);

// ============================================
// ARCADE BUTTON STYLES
// ============================================

/** Primary arcade button (cyan glow) */
export const arcadeButtonPrimary = cn(
  "bg-cyan-500 text-black font-bold rounded-lg",
  "shadow-[0_0_15px_rgba(0,255,255,0.4)]",
  "hover:bg-cyan-400 hover:shadow-[0_0_25px_rgba(0,255,255,0.6)]",
  "active:scale-95 transition-all duration-200"
);

/** Secondary arcade button (yellow glow) */
export const arcadeButtonSecondary = cn(
  "bg-yellow-400 text-black font-bold rounded-lg",
  "shadow-[0_0_15px_rgba(255,255,0,0.4)]",
  "hover:bg-yellow-300 hover:shadow-[0_0_25px_rgba(255,255,0,0.6)]",
  "active:scale-95 transition-all duration-200"
);

/** Tertiary arcade button (lime glow) */
export const arcadeButtonTertiary = cn(
  "bg-lime-400 text-black font-bold rounded-lg",
  "shadow-[0_0_15px_rgba(0,255,0,0.4)]",
  "hover:bg-lime-300 hover:shadow-[0_0_25px_rgba(0,255,0,0.6)]",
  "active:scale-95 transition-all duration-200"
);

/** Ghost arcade button (translucent with glow on hover) */
export const arcadeButtonGhost = cn(
  "bg-transparent border border-cyan-500/30 text-cyan-400 font-bold rounded-lg",
  "hover:bg-cyan-500/20 hover:border-cyan-500/60",
  "hover:shadow-[0_0_15px_rgba(0,255,255,0.3)]",
  "active:scale-95 transition-all duration-200"
);

/** Destructive arcade button (red glow) */
export const arcadeButtonDestructive = cn(
  "bg-red-500 text-white font-bold rounded-lg",
  "shadow-[0_0_15px_rgba(255,0,0,0.4)]",
  "hover:bg-red-400 hover:shadow-[0_0_25px_rgba(255,0,0,0.6)]",
  "active:scale-95 transition-all duration-200"
);

// ============================================
// ARCADE BADGE STYLES
// ============================================

export const arcadeBadge = {
  cyan: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
  yellow: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  lime: "bg-lime-500/20 text-lime-400 border border-lime-500/30",
  fuchsia: "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30",
  purple: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  red: "bg-red-500/20 text-red-400 border border-red-500/30",
  blue: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  orange: "bg-orange-500/20 text-orange-400 border border-orange-500/30",
} as const;

// ============================================
// ARCADE INPUT STYLES
// ============================================

export const arcadeInput = cn(
  "bg-[#0a0a12] border border-cyan-500/20 rounded-lg",
  "text-white placeholder:text-gray-500",
  "focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40",
  "focus:shadow-[0_0_15px_rgba(0,255,255,0.2)]",
  "transition-all duration-200"
);

export const arcadeInputYellow = cn(
  "bg-[#0a0a12] border border-yellow-500/20 rounded-lg",
  "text-white placeholder:text-gray-500",
  "focus:border-yellow-500/60 focus:ring-1 focus:ring-yellow-500/40",
  "focus:shadow-[0_0_15px_rgba(255,255,0,0.2)]",
  "transition-all duration-200"
);

// ============================================
// ARCADE TEXT STYLES
// ============================================

export const arcadeTitle = cn(
  "text-2xl font-bold text-cyan-400",
  "drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]"
);

export const arcadeTitleYellow = cn(
  "text-2xl font-bold text-yellow-400",
  "drop-shadow-[0_0_10px_rgba(255,255,0,0.5)]"
);

export const arcadeTitleLime = cn(
  "text-2xl font-bold text-lime-400",
  "drop-shadow-[0_0_10px_rgba(0,255,0,0.5)]"
);

export const arcadeSubtitle = cn(
  "text-sm text-gray-400"
);

export const arcadeText = cn(
  "text-gray-300"
);

export const arcadeTextMuted = cn(
  "text-gray-500"
);

// ============================================
// ARCADE ANIMATION KEYFRAMES
// ============================================

export const arcadeAnimations = {
  fadeIn: "animate-in fade-in duration-200",
  slideInTop: "animate-in fade-in slide-in-from-top-2 duration-200",
  slideInBottom: "animate-in fade-in slide-in-from-bottom-2 duration-200",
  slideInLeft: "animate-in fade-in slide-in-from-left-2 duration-200",
  slideInRight: "animate-in fade-in slide-in-from-right-2 duration-200",
  pulse: "animate-pulse",
  glow: "animate-[arcade-glow_2s_ease-in-out_infinite]",
} as const;

// ============================================
// ARCADE UTILITY FUNCTIONS
// ============================================

/** Get button style for a specific color theme */
export function getArcadeButton(color: 'cyan' | 'yellow' | 'lime' | 'fuchsia' | 'purple' | 'red' = 'cyan') {
  const styles = {
    cyan: arcadeButtonPrimary,
    yellow: arcadeButtonSecondary,
    lime: arcadeButtonTertiary,
    fuchsia: cn(
      "bg-fuchsia-500 text-black font-bold rounded-lg",
      "shadow-[0_0_15px_rgba(255,0,255,0.4)]",
      "hover:bg-fuchsia-400 hover:shadow-[0_0_25px_rgba(255,0,255,0.6)]",
      "active:scale-95 transition-all duration-200"
    ),
    purple: cn(
      "bg-purple-500 text-white font-bold rounded-lg",
      "shadow-[0_0_15px_rgba(168,85,247,0.4)]",
      "hover:bg-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]",
      "active:scale-95 transition-all duration-200"
    ),
    red: arcadeButtonDestructive,
  };
  return styles[color];
}

/** Get card style for a specific color theme */
export function getArcadeCard(color: 'cyan' | 'yellow' | 'lime' | 'fuchsia' | 'purple' = 'cyan') {
  const styles = {
    cyan: arcadeCard,
    yellow: arcadeCardYellow,
    lime: arcadeCardLime,
    fuchsia: arcadeCardFuchsia,
    purple: arcadeCardPurple,
  };
  return styles[color];
}

/** Priority to arcade color mapping */
export function getPriorityColor(priority: string): keyof typeof arcadeBadge {
  switch (priority) {
    case 'high': return 'red';
    case 'medium': return 'yellow';
    case 'low': return 'lime';
    default: return 'cyan';
  }
}

/** Status to arcade color mapping */
export function getStatusColor(status: string): keyof typeof arcadeBadge {
  switch (status) {
    case 'done': return 'lime';
    case 'in_progress': return 'cyan';
    case 'blocked': return 'red';
    case 'review': return 'purple';
    default: return 'yellow';
  }
}
