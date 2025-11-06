/**
 * Advanced Color Theory Engine with CIELAB color space calculations
 * Implements professional color harmony rules and WCAG 2.1 AAA compliance
 */

export interface RGBColor {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface LABColor {
  l: number; // 0-100 (lightness)
  a: number; // -128 to 127 (green-red)
  b: number; // -128 to 127 (blue-yellow)
}

export interface HSLColor {
  h: number; // 0-360 (hue)
  s: number; // 0-100 (saturation)
  l: number; // 0-100 (lightness)
}

export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string; // base
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export type ColorHarmonyType = 
  | 'monochromatic' 
  | 'analogous' 
  | 'complementary' 
  | 'triadic' 
  | 'split-complementary'
  | 'tetradic';

export type BrandPersonality = 
  | 'trustworthy'
  | 'innovative'
  | 'luxurious'
  | 'playful'
  | 'authoritative'
  | 'energetic'
  | 'calm';

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGBColor {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 0, g: 0, b: 0 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(rgb: RGBColor): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Convert RGB to XYZ color space (D65 illuminant)
 */
function rgbToXyz(rgb: RGBColor): { x: number; y: number; z: number } {
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  // Apply gamma correction
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

  // Convert to XYZ using sRGB D65 matrix
  const x = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
  const y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
  const z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

  return { x: x * 100, y: y * 100, z: z * 100 };
}

/**
 * Convert XYZ to LAB color space (CIELAB)
 */
function xyzToLab(xyz: { x: number; y: number; z: number }): LABColor {
  // D65 illuminant reference white
  const refX = 95.047;
  const refY = 100.000;
  const refZ = 108.883;

  let x = xyz.x / refX;
  let y = xyz.y / refY;
  let z = xyz.z / refZ;

  // Apply the LAB transformation function
  const f = (t: number) => {
    return t > 0.008856 ? Math.pow(t, 1 / 3) : (7.787 * t) + (16 / 116);
  };

  x = f(x);
  y = f(y);
  z = f(z);

  const l = (116 * y) - 16;
  const a = 500 * (x - y);
  const b = 200 * (y - z);

  return { l, a, b };
}

/**
 * Convert LAB to XYZ color space
 */
function labToXyz(lab: LABColor): { x: number; y: number; z: number } {
  const refX = 95.047;
  const refY = 100.000;
  const refZ = 108.883;

  let y = (lab.l + 16) / 116;
  let x = lab.a / 500 + y;
  let z = y - lab.b / 200;

  const f = (t: number) => {
    const t3 = Math.pow(t, 3);
    return t3 > 0.008856 ? t3 : (t - 16 / 116) / 7.787;
  };

  x = refX * f(x);
  y = refY * f(y);
  z = refZ * f(z);

  return { x, y, z };
}

/**
 * Convert XYZ to RGB color space
 */
function xyzToRgb(xyz: { x: number; y: number; z: number }): RGBColor {
  let x = xyz.x / 100;
  let y = xyz.y / 100;
  let z = xyz.z / 100;

  // Convert XYZ to linear RGB using sRGB D65 matrix
  let r = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
  let g = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
  let b = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;

  // Apply gamma correction
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  b = b > 0.0031308 ? 1.055 * Math.pow(b, 1 / 2.4) - 0.055 : 12.92 * b;

  return {
    r: Math.max(0, Math.min(255, Math.round(r * 255))),
    g: Math.max(0, Math.min(255, Math.round(g * 255))),
    b: Math.max(0, Math.min(255, Math.round(b * 255))),
  };
}

/**
 * Convert hex color to CIELAB color space
 */
export function hexToLab(hex: string): LABColor {
  const rgb = hexToRgb(hex);
  const xyz = rgbToXyz(rgb);
  return xyzToLab(xyz);
}

/**
 * Convert CIELAB color to hex
 */
export function labToHex(lab: LABColor): string {
  const xyz = labToXyz(lab);
  const rgb = xyzToRgb(xyz);
  return rgbToHex(rgb);
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGBColor): HSLColor {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  const l = (max + min) / 2;

  if (diff === 0) {
    return { h: 0, s: 0, l: l * 100 };
  }

  const s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);

  let h = 0;
  if (max === r) {
    h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
  } else if (max === g) {
    h = ((b - r) / diff + 2) / 6;
  } else {
    h = ((r - g) / diff + 4) / 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSLColor): RGBColor {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const gray = Math.round(l * 255);
    return { r: gray, g: gray, b: gray };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

/**
 * Calculate perceptual color difference using CIEDE2000 formula
 */
export function calculateColorDifference(lab1: LABColor, lab2: LABColor): number {
  // Simplified CIEDE2000 implementation
  const deltaL = lab2.l - lab1.l;
  const deltaA = lab2.a - lab1.a;
  const deltaB = lab2.b - lab1.b;

  const c1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
  const c2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
  const deltaC = c2 - c1;

  const deltaH = Math.sqrt(deltaA * deltaA + deltaB * deltaB - deltaC * deltaC);

  const sl = 1;
  const kl = 1;
  const kc = 1;
  const kh = 1;

  const sc = 1 + 0.045 * c1;
  const sh = 1 + 0.015 * c1;

  const deltaE = Math.sqrt(
    Math.pow(deltaL / (kl * sl), 2) +
    Math.pow(deltaC / (kc * sc), 2) +
    Math.pow(deltaH / (kh * sh), 2)
  );

  return deltaE;
}

/**
 * Calculate relative luminance for WCAG contrast calculations
 */
export function getRelativeLuminance(rgb: RGBColor): number {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((val) => {
    const srgb = val / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate WCAG 2.1 contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color pair meets WCAG AAA standard (7:1 for normal text, 4.5:1 for large text)
 */
export function meetsWCAG_AAA(foreground: string, background: string, isLargeText = false): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Adjust color to meet WCAG AAA contrast requirements
 */
export function adjustForContrast(
  foreground: string,
  background: string,
  targetRatio = 7,
  maxIterations = 50
): string {
  let fg = hexToRgb(foreground);
  let currentRatio = getContrastRatio(rgbToHex(fg), background);
  
  if (currentRatio >= targetRatio) {
    return rgbToHex(fg);
  }

  const bgLum = getRelativeLuminance(hexToRgb(background));
  const shouldLighten = bgLum < 0.5;

  for (let i = 0; i < maxIterations; i++) {
    if (shouldLighten) {
      fg = { r: fg.r + 5, g: fg.g + 5, b: fg.b + 5 };
    } else {
      fg = { r: fg.r - 5, g: fg.g - 5, b: fg.b - 5 };
    }

    // Clamp values
    fg.r = Math.max(0, Math.min(255, fg.r));
    fg.g = Math.max(0, Math.min(255, fg.g));
    fg.b = Math.max(0, Math.min(255, fg.b));

    currentRatio = getContrastRatio(rgbToHex(fg), background);
    if (currentRatio >= targetRatio) {
      return rgbToHex(fg);
    }

    // Exit if we've reached color limits
    if ((shouldLighten && fg.r >= 255 && fg.g >= 255 && fg.b >= 255) ||
        (!shouldLighten && fg.r <= 0 && fg.g <= 0 && fg.b <= 0)) {
      break;
    }
  }

  return rgbToHex(fg);
}

/**
 * Generate a perceptually uniform color scale (50-950) from base color
 */
export function generateColorScale(baseHex: string): ColorScale {
  const baseLab = hexToLab(baseHex);
  
  // Generate scale with perceptually uniform lightness steps
  const lightnessSteps = {
    50: 95,
    100: 90,
    200: 80,
    300: 70,
    400: 60,
    500: baseLab.l, // base
    600: baseLab.l - 10,
    700: baseLab.l - 20,
    800: baseLab.l - 30,
    900: baseLab.l - 40,
    950: 15,
  };

  const scale: Partial<ColorScale> = {};
  
  for (const [key, lightness] of Object.entries(lightnessSteps)) {
    const adjustedLab: LABColor = {
      l: lightness,
      a: baseLab.a * (lightness / baseLab.l), // Maintain chroma proportionally
      b: baseLab.b * (lightness / baseLab.l),
    };
    scale[key as keyof ColorScale] = labToHex(adjustedLab);
  }

  return scale as ColorScale;
}

/**
 * Generate color harmony palette based on color theory
 */
export function generateColorHarmony(
  baseHex: string,
  harmonyType: ColorHarmonyType
): string[] {
  const hsl = rgbToHsl(hexToRgb(baseHex));
  const colors: string[] = [baseHex];

  switch (harmonyType) {
    case 'monochromatic': {
      // Same hue, different lightness/saturation
      for (let i = 1; i <= 4; i++) {
        const newHsl: HSLColor = {
          h: hsl.h,
          s: Math.max(10, Math.min(90, hsl.s + (i - 2) * 15)),
          l: Math.max(15, Math.min(85, hsl.l + (i - 2) * 20)),
        };
        colors.push(rgbToHex(hslToRgb(newHsl)));
      }
      break;
    }

    case 'analogous': {
      // Adjacent hues (within 30 degrees)
      [-30, -15, 15, 30].forEach((offset) => {
        const newHsl: HSLColor = {
          h: (hsl.h + offset + 360) % 360,
          s: hsl.s,
          l: hsl.l,
        };
        colors.push(rgbToHex(hslToRgb(newHsl)));
      });
      break;
    }

    case 'complementary': {
      // Opposite on color wheel (180 degrees)
      const complementHsl: HSLColor = {
        h: (hsl.h + 180) % 360,
        s: hsl.s,
        l: hsl.l,
      };
      colors.push(rgbToHex(hslToRgb(complementHsl)));
      
      // Add tints and shades
      [0.7, 1.3].forEach((mult) => {
        const tint: HSLColor = { ...hsl, l: Math.min(85, hsl.l * mult) };
        const shade: HSLColor = { ...complementHsl, l: Math.min(85, complementHsl.l * mult) };
        colors.push(rgbToHex(hslToRgb(tint)));
        colors.push(rgbToHex(hslToRgb(shade)));
      });
      break;
    }

    case 'triadic': {
      // Three colors evenly spaced (120 degrees apart)
      [120, 240].forEach((offset) => {
        const newHsl: HSLColor = {
          h: (hsl.h + offset) % 360,
          s: hsl.s,
          l: hsl.l,
        };
        colors.push(rgbToHex(hslToRgb(newHsl)));
      });
      break;
    }

    case 'split-complementary': {
      // Base color + two colors adjacent to complement
      const complement = (hsl.h + 180) % 360;
      [complement - 30, complement + 30].forEach((h) => {
        const newHsl: HSLColor = {
          h: (h + 360) % 360,
          s: hsl.s,
          l: hsl.l,
        };
        colors.push(rgbToHex(hslToRgb(newHsl)));
      });
      break;
    }

    case 'tetradic': {
      // Four colors in rectangular arrangement
      [60, 180, 240].forEach((offset) => {
        const newHsl: HSLColor = {
          h: (hsl.h + offset) % 360,
          s: hsl.s,
          l: hsl.l,
        };
        colors.push(rgbToHex(hslToRgb(newHsl)));
      });
      break;
    }
  }

  return colors;
}

/**
 * Get brand personality color mapping based on psychology
 */
export function getBrandPersonalityColor(personality: BrandPersonality): string {
  const colorMap: Record<BrandPersonality, string> = {
    trustworthy: '#2563EB',    // Blue - trust, stability
    innovative: '#8B5CF6',     // Purple - creativity, innovation
    luxurious: '#1F2937',      // Dark gray - sophistication
    playful: '#F59E0B',        // Orange - energy, fun
    authoritative: '#1E293B',  // Navy - authority, professionalism
    energetic: '#EF4444',      // Red - passion, energy
    calm: '#10B981',           // Green - nature, calm
  };

  return colorMap[personality];
}

/**
 * Generate semantic colors with proper contrast ratios
 */
export interface SemanticColors {
  success: { light: string; base: string; dark: string; contrast: string };
  warning: { light: string; base: string; dark: string; contrast: string };
  error: { light: string; base: string; dark: string; contrast: string };
  info: { light: string; base: string; dark: string; contrast: string };
}

export function generateSemanticColors(background: string): SemanticColors {
  const baseColors = {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  };

  const semantic: Partial<SemanticColors> = {};

  for (const [key, baseColor] of Object.entries(baseColors)) {
    const lab = hexToLab(baseColor);
    
    semantic[key as keyof SemanticColors] = {
      light: labToHex({ ...lab, l: Math.min(95, lab.l + 30) }),
      base: baseColor,
      dark: labToHex({ ...lab, l: Math.max(15, lab.l - 20) }),
      contrast: adjustForContrast('#FFFFFF', baseColor, 4.5),
    };
  }

  return semantic as SemanticColors;
}

/**
 * Generate surface colors for backgrounds, cards, overlays
 */
export interface SurfaceColors {
  background: string;
  card: string;
  overlay: string;
  popover: string;
  hover: string;
}

export function generateSurfaceColors(baseBackground: string): SurfaceColors {
  const baseLab = hexToLab(baseBackground);
  const isDark = baseLab.l < 50;

  return {
    background: baseBackground,
    card: labToHex({ ...baseLab, l: isDark ? baseLab.l + 5 : baseLab.l - 3 }),
    overlay: labToHex({ ...baseLab, l: isDark ? baseLab.l + 10 : baseLab.l - 6 }),
    popover: labToHex({ ...baseLab, l: isDark ? baseLab.l + 8 : baseLab.l - 4 }),
    hover: labToHex({ ...baseLab, l: isDark ? baseLab.l + 3 : baseLab.l - 2 }),
  };
}
