// Design System Constants for Advanced Design Elements

export interface DesignElementConfig {
  width?: number;
  height?: number;
  radius?: number;
  rx?: number;
  ry?: number;
  borderRadius?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  points?: number[][] | number; // Support both polygon points and star point count
  outerRadius?: number;
  innerRadius?: number;
  sides?: number;
  rotation?: number;
  colors?: string[];
  angle?: number;
  type?: string;
  blur?: number;
  opacity?: number;
  border?: string;
  shadowLight?: string;
  shadowDark?: string;
  x?: number;
  y?: number;
  color?: string;
}

export interface DesignElement {
  type: 'shape' | 'frame' | 'mockup' | 'icon' | 'pattern' | 'effect';
  variant: string;
  name: string;
  category: string;
  isPremium?: boolean;
  config: DesignElementConfig;
}

// Professional Color Palettes (Figma/Canva style)
export const COLOR_PALETTES = {
  trending: {
    name: 'Trending',
    colors: [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ]
  },
  minimal: {
    name: 'Minimal',
    colors: [
      '#2C3E50', '#34495E', '#7F8C8D', '#BDC3C7', '#ECF0F1',
      '#95A5A6', '#D5DBDB', '#F8F9FA', '#6C757D', '#ADB5BD'
    ]
  },
  vibrant: {
    name: 'Vibrant',
    colors: [
      '#E74C3C', '#8E44AD', '#3498DB', '#2ECC71', '#F39C12',
      '#E67E22', '#1ABC9C', '#9B59B6', '#F1C40F', '#E91E63'
    ]
  },
  pastel: {
    name: 'Pastel',
    colors: [
      '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
      '#D4BAFF', '#FFBAFF', '#FFD1BA', '#C9FFBA', '#BAFFFF'
    ]
  },
  corporate: {
    name: 'Corporate',
    colors: [
      '#1E3A8A', '#1E40AF', '#2563EB', '#3B82F6', '#60A5FA',
      '#1F2937', '#374151', '#4B5563', '#6B7280', '#9CA3AF'
    ]
  },
  nature: {
    name: 'Nature',
    colors: [
      '#16A085', '#27AE60', '#2ECC71', '#58D68D', '#82E0AA',
      '#D68910', '#E67E22', '#F39C12', '#F1C40F', '#F4D03F'
    ]
  }
};

// Professional Typography Scale
export const TYPOGRAPHY_SCALE = {
  fonts: [
    { name: 'Inter', category: 'Sans Serif', style: 'Modern', premium: false },
    { name: 'Helvetica Neue', category: 'Sans Serif', style: 'Classic', premium: true },
    { name: 'SF Pro Display', category: 'Sans Serif', style: 'Apple', premium: true },
    { name: 'Roboto', category: 'Sans Serif', style: 'Google', premium: false },
    { name: 'Poppins', category: 'Sans Serif', style: 'Geometric', premium: false },
    { name: 'Montserrat', category: 'Sans Serif', style: 'Urban', premium: false },
    { name: 'Playfair Display', category: 'Serif', style: 'Elegant', premium: true },
    { name: 'Merriweather', category: 'Serif', style: 'Readable', premium: false },
    { name: 'Source Code Pro', category: 'Monospace', style: 'Code', premium: false },
    { name: 'JetBrains Mono', category: 'Monospace', style: 'Modern Code', premium: true }
  ],
  sizes: {
    'Display 1': { size: '72px', lineHeight: '80px', weight: '700' },
    'Display 2': { size: '64px', lineHeight: '72px', weight: '700' },
    'Headline 1': { size: '48px', lineHeight: '56px', weight: '600' },
    'Headline 2': { size: '40px', lineHeight: '48px', weight: '600' },
    'Title 1': { size: '32px', lineHeight: '40px', weight: '600' },
    'Title 2': { size: '28px', lineHeight: '36px', weight: '600' },
    'Body Large': { size: '18px', lineHeight: '28px', weight: '400' },
    'Body': { size: '16px', lineHeight: '24px', weight: '400' },
    'Body Small': { size: '14px', lineHeight: '20px', weight: '400' },
    'Caption': { size: '12px', lineHeight: '16px', weight: '400' }
  }
};

// Advanced Shape Library (Figma/Canva inspired)
export const ADVANCED_SHAPES: DesignElement[] = [
  // Basic Shapes
  { type: 'shape', variant: 'rectangle', name: 'Rectangle', category: 'Basic', config: { width: 200, height: 120, fill: '#3B82F6', borderRadius: 0 } },
  { type: 'shape', variant: 'rounded-rectangle', name: 'Rounded Rectangle', category: 'Basic', config: { width: 200, height: 120, fill: '#6366F1', borderRadius: 12 } },
  { type: 'shape', variant: 'circle', name: 'Circle', category: 'Basic', config: { radius: 60, fill: '#8B5CF6' } },
  { type: 'shape', variant: 'ellipse', name: 'Ellipse', category: 'Basic', config: { rx: 80, ry: 50, fill: '#EC4899' } },
  
  // Geometric Shapes
  { type: 'shape', variant: 'triangle', name: 'Triangle', category: 'Geometric', config: { points: [[100, 20], [20, 180], [180, 180]], fill: '#F59E0B' } },
  { type: 'shape', variant: 'diamond', name: 'Diamond', category: 'Geometric', config: { width: 100, height: 100, fill: '#10B981', rotation: 45 } },
  { type: 'shape', variant: 'hexagon', name: 'Hexagon', category: 'Geometric', config: { radius: 60, sides: 6, fill: '#06B6D4' } },
  { type: 'shape', variant: 'octagon', name: 'Octagon', category: 'Geometric', config: { radius: 60, sides: 8, fill: '#84CC16' } },
  { type: 'shape', variant: 'pentagon', name: 'Pentagon', category: 'Geometric', config: { radius: 60, sides: 5, fill: '#EAB308' } },
  
  // Stars & Decorative
  { type: 'shape', variant: 'star-5', name: '5-Point Star', category: 'Decorative', config: { outerRadius: 60, innerRadius: 25, points: 5, fill: '#F97316' } },
  { type: 'shape', variant: 'star-6', name: '6-Point Star', category: 'Decorative', config: { outerRadius: 60, innerRadius: 25, points: 6, fill: '#EF4444' } },
  { type: 'shape', variant: 'heart', name: 'Heart', category: 'Decorative', isPremium: true, config: { width: 80, height: 70, fill: '#F43F5E' } },
  { type: 'shape', variant: 'cloud', name: 'Cloud', category: 'Decorative', isPremium: true, config: { width: 120, height: 80, fill: '#94A3B8' } },
  
  // Arrows & Pointers
  { type: 'shape', variant: 'arrow-right', name: 'Arrow Right', category: 'Arrows', config: { width: 100, height: 40, fill: '#374151' } },
  { type: 'shape', variant: 'arrow-left', name: 'Arrow Left', category: 'Arrows', config: { width: 100, height: 40, fill: '#374151' } },
  { type: 'shape', variant: 'arrow-up', name: 'Arrow Up', category: 'Arrows', config: { width: 40, height: 100, fill: '#374151' } },
  { type: 'shape', variant: 'arrow-down', name: 'Arrow Down', category: 'Arrows', config: { width: 40, height: 100, fill: '#374151' } },
  { type: 'shape', variant: 'chevron-right', name: 'Chevron Right', category: 'Arrows', config: { width: 60, height: 60, fill: '#6B7280' } },
  
  // Speech Bubbles
  { type: 'shape', variant: 'speech-bubble', name: 'Speech Bubble', category: 'Speech', isPremium: true, config: { width: 120, height: 80, fill: '#FFFFFF', stroke: '#E5E7EB' } },
  { type: 'shape', variant: 'thought-bubble', name: 'Thought Bubble', category: 'Speech', isPremium: true, config: { width: 120, height: 80, fill: '#FFFFFF', stroke: '#E5E7EB' } },
  
  // Badges & Labels
  { type: 'shape', variant: 'badge-circle', name: 'Circle Badge', category: 'Badges', config: { radius: 30, fill: '#DC2626' } },
  { type: 'shape', variant: 'badge-ribbon', name: 'Ribbon Badge', category: 'Badges', isPremium: true, config: { width: 100, height: 40, fill: '#16A34A' } },
  { type: 'shape', variant: 'price-tag', name: 'Price Tag', category: 'Badges', config: { width: 80, height: 40, fill: '#CA8A04' } },
];

// Professional Device Mockups
export const DEVICE_MOCKUPS: DesignElement[] = [
  // Mobile Devices
  { type: 'mockup', variant: 'iphone-14-pro', name: 'iPhone 14 Pro', category: 'Mobile', isPremium: true, config: { width: 180, height: 390, borderRadius: 25, fill: '#1A1A1A' } },
  { type: 'mockup', variant: 'iphone-14', name: 'iPhone 14', category: 'Mobile', isPremium: true, config: { width: 175, height: 380, borderRadius: 22, fill: '#2563EB' } },
  { type: 'mockup', variant: 'samsung-s23', name: 'Samsung S23', category: 'Mobile', config: { width: 170, height: 375, borderRadius: 20, fill: '#000000' } },
  { type: 'mockup', variant: 'pixel-7', name: 'Google Pixel 7', category: 'Mobile', config: { width: 165, height: 370, borderRadius: 18, fill: '#34A853' } },
  
  // Tablets
  { type: 'mockup', variant: 'ipad-pro-12', name: 'iPad Pro 12.9"', category: 'Tablet', isPremium: true, config: { width: 320, height: 420, borderRadius: 15, fill: '#F3F4F6' } },
  { type: 'mockup', variant: 'ipad-air', name: 'iPad Air', category: 'Tablet', isPremium: true, config: { width: 300, height: 390, borderRadius: 12, fill: '#E5E7EB' } },
  { type: 'mockup', variant: 'surface-pro', name: 'Surface Pro', category: 'Tablet', config: { width: 310, height: 400, borderRadius: 8, fill: '#6B7280' } },
  
  // Laptops
  { type: 'mockup', variant: 'macbook-pro-16', name: 'MacBook Pro 16"', category: 'Laptop', isPremium: true, config: { width: 480, height: 300, borderRadius: 8, fill: '#1F2937' } },
  { type: 'mockup', variant: 'macbook-air', name: 'MacBook Air', category: 'Laptop', isPremium: true, config: { width: 450, height: 280, borderRadius: 6, fill: '#F9FAFB' } },
  { type: 'mockup', variant: 'surface-laptop', name: 'Surface Laptop', category: 'Laptop', config: { width: 460, height: 290, borderRadius: 4, fill: '#3B82F6' } },
  
  // Desktops
  { type: 'mockup', variant: 'imac-24', name: 'iMac 24"', category: 'Desktop', isPremium: true, config: { width: 520, height: 380, borderRadius: 12, fill: '#F0F9FF' } },
  { type: 'mockup', variant: 'studio-display', name: 'Studio Display', category: 'Desktop', isPremium: true, config: { width: 500, height: 350, borderRadius: 8, fill: '#111827' } },
  { type: 'mockup', variant: 'generic-monitor', name: 'Monitor', category: 'Desktop', config: { width: 480, height: 320, borderRadius: 4, fill: '#374151' } },
  
  // Wearables
  { type: 'mockup', variant: 'apple-watch', name: 'Apple Watch', category: 'Wearable', isPremium: true, config: { width: 80, height: 100, borderRadius: 20, fill: '#000000' } },
  { type: 'mockup', variant: 'galaxy-watch', name: 'Galaxy Watch', category: 'Wearable', config: { width: 85, height: 85, borderRadius: 42, fill: '#1F2937' } },
  
  // Social Media Frames
  { type: 'frame', variant: 'instagram-post', name: 'Instagram Post', category: 'Social', config: { width: 300, height: 300, borderRadius: 8, fill: '#FFFFFF', stroke: '#DBDBDB' } },
  { type: 'frame', variant: 'instagram-story', name: 'Instagram Story', category: 'Social', config: { width: 200, height: 355, borderRadius: 12, fill: '#FFFFFF', stroke: '#DBDBDB' } },
  { type: 'frame', variant: 'facebook-cover', name: 'Facebook Cover', category: 'Social', config: { width: 400, height: 150, borderRadius: 8, fill: '#FFFFFF', stroke: '#E4E6EA' } },
  { type: 'frame', variant: 'linkedin-banner', name: 'LinkedIn Banner', category: 'Social', config: { width: 400, height: 100, borderRadius: 6, fill: '#FFFFFF', stroke: '#D0D7DE' } },
  { type: 'frame', variant: 'youtube-thumbnail', name: 'YouTube Thumbnail', category: 'Social', config: { width: 320, height: 180, borderRadius: 4, fill: '#FFFFFF', stroke: '#CC0000' } },
];

// Design Effects & Patterns
export const DESIGN_EFFECTS: DesignElement[] = [
  { type: 'effect', variant: 'gradient-linear', name: 'Linear Gradient', category: 'Gradients', config: { type: 'linear', colors: ['#FF6B6B', '#4ECDC4'], angle: 45 } },
  { type: 'effect', variant: 'gradient-radial', name: 'Radial Gradient', category: 'Gradients', config: { type: 'radial', colors: ['#667eea', '#764ba2'] } },
  { type: 'effect', variant: 'glassmorphism', name: 'Glassmorphism', category: 'Modern', isPremium: true, config: { blur: 10, opacity: 0.25, border: 'rgba(255,255,255,0.18)' } },
  { type: 'effect', variant: 'neumorphism', name: 'Neumorphism', category: 'Modern', isPremium: true, config: { shadowLight: '#ffffff', shadowDark: '#d1d9e6' } },
  { type: 'effect', variant: 'drop-shadow', name: 'Drop Shadow', category: 'Shadows', config: { x: 0, y: 4, blur: 6, color: 'rgba(0,0,0,0.1)' } },
  { type: 'effect', variant: 'inner-shadow', name: 'Inner Shadow', category: 'Shadows', config: { x: 0, y: 2, blur: 4, color: 'rgba(0,0,0,0.06)' } },
];