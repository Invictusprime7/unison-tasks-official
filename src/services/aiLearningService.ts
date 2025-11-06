import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string;
  background: string;
}

export interface Typography {
  primary: string;
  secondary?: string;
  sizes: string[];
  weights: string[];
}

export interface TemplatePattern {
  id: string;
  name: string;
  category: string;
  design_style: string;
  template_code: string;
  css_framework: string;
  complexity_level: number;
  ui_components: string[];
  design_principles: string[];
  color_scheme: ColorScheme;
  typography: Typography;
  layout_structure: string;
  usage_count: number;
  success_rating: number;
}

export interface GenerationHistory {
  id: string;
  user_id: string;
  session_id: string;
  generation_number: number;
  prompt: string;
  generated_code: string;
  template_pattern_id?: string;
  design_style: string;
  category: string;
  generation_method: 'from_scratch' | 'based_on_pattern' | 'iteration';
  user_modifications?: string;
  execution_time_ms: number;
  tokens_used: number;
}

export interface UserFeedback {
  generation_id: string;
  rating: number;
  feedback_type: 'design' | 'code_quality' | 'usability' | 'creativity';
  feedback_text?: string;
  helpful_elements?: string[];
  improvement_suggestions?: string[];
  would_use_again: boolean;
}

export interface PatternData {
  helpful_elements?: string[];
  feedback_type?: string;
  rating?: number;
  common_elements?: string[];
  success_factors?: string[];
  [key: string]: unknown;
}

export interface LearningInsight {
  insight_type: string;
  category: string;
  design_style: string;
  pattern_data: PatternData;
  confidence_score: number;
  usage_count: number;
  success_rate: number;
}

export interface UserPreferences {
  preferred_styles?: string[];
  preferred_categories?: string[];
  color_preferences?: ColorScheme;
  layout_preferences?: { [key: string]: string | number | boolean };
  complexity_preference?: number;
}

export class AILearningService {
  public currentSessionId: string;
  private templatePatterns: TemplatePattern[] = [];
  private learningInsights: LearningInsight[] = [];
  private userPreferences: Map<string, UserPreferences> = new Map();

  constructor() {
    this.currentSessionId = uuidv4();
    this.initializeTemplatePatterns();
    this.loadFromStorage();
  }

  private initializeTemplatePatterns() {
    // Initialize with built-in professional templates
    this.templatePatterns = [
      {
        id: '1',
        name: 'Modern SaaS Landing',
        category: 'landing',
        design_style: 'modern',
        template_code: this.getModernSaaSTemplate(),
        css_framework: 'tailwind',
        complexity_level: 4,
        ui_components: ['navigation', 'hero', 'features', 'cards', 'buttons', 'gradients'],
        design_principles: ['visual_hierarchy', 'whitespace', 'consistency', 'accessibility', 'responsive_design'],
        color_scheme: { primary: '#8B5CF6', secondary: '#EC4899', accent: '#06B6D4', neutral: '#1E293B', background: 'gradient' },
        typography: { primary: 'system-ui', sizes: ['text-5xl', 'text-2xl', 'text-xl'], weights: ['font-bold', 'font-semibold'] },
        layout_structure: 'flexbox',
        usage_count: 0,
        success_rating: 4.5
      },
      {
        id: '2',
        name: 'Creative Portfolio',
        category: 'portfolio',
        design_style: 'minimalist',
        template_code: this.getCreativePortfolioTemplate(),
        css_framework: 'tailwind',
        complexity_level: 3,
        ui_components: ['header', 'navigation', 'hero', 'grid', 'cards', 'footer'],
        design_principles: ['minimalism', 'whitespace', 'typography', 'visual_hierarchy', 'clean_layout'],
        color_scheme: { primary: '#111827', secondary: '#6B7280', accent: '#F9FAFB', neutral: '#E5E7EB', background: '#F9FAFB' },
        typography: { primary: 'system-ui', secondary: 'serif', sizes: ['text-8xl', 'text-3xl', 'text-xl'], weights: ['font-light', 'font-serif'] },
        layout_structure: 'grid',
        usage_count: 0,
        success_rating: 4.3
      },
      {
        id: '3',
        name: 'Analytics Dashboard',
        category: 'dashboard',
        design_style: 'corporate',
        template_code: this.getAnalyticsDashboardTemplate(),
        css_framework: 'tailwind',
        complexity_level: 5,
        ui_components: ['sidebar', 'navigation', 'stats_cards', 'charts', 'tables', 'buttons'],
        design_principles: ['data_visualization', 'information_hierarchy', 'consistency', 'usability', 'responsive_design'],
        color_scheme: { primary: '#2563EB', secondary: '#10B981', accent: '#F59E0B', neutral: '#6B7280', background: '#F3F4F6' },
        typography: { primary: 'system-ui', sizes: ['text-3xl', 'text-lg', 'text-sm'], weights: ['font-bold', 'font-semibold', 'font-medium'] },
        layout_structure: 'flexbox',
        usage_count: 0,
        success_rating: 4.7
      }
    ];
  }

  /**
   * Generate enhanced prompt with glass UI aesthetic and animation focus
   */
  async generateEnhancedPrompt(
    basePrompt: string,
    userId: string,
    category: string = 'general',
    designStyle: string = 'glass_modern'
  ): Promise<string> {
    // Get relevant template patterns
    let patterns = [...this.templatePatterns];
    if (category) {
      patterns = patterns.filter(p => p.category === category);
    }
    if (designStyle) {
      patterns = patterns.filter(p => p.design_style === designStyle);
    }
    patterns = patterns.filter(p => p.success_rating >= 3.5);

    // Get user preferences
    const userPrefs = await this.getUserPreferences(userId);

    // Get learning insights
    const insights = await this.getLearningInsights('ui_patterns');

    let enhancedPrompt = `Generate a powerful state-driven animated template with clean glass UI aesthetic:\n\n`;
    enhancedPrompt += `Base Request: ${basePrompt}\n\n`;

    // Glass UI Design System
    enhancedPrompt += `Glass UI Design Requirements:\n`;
    enhancedPrompt += `- Use backdrop-filter: blur() for glass morphism effects\n`;
    enhancedPrompt += `- Semi-transparent backgrounds with rgba() values\n`;
    enhancedPrompt += `- Subtle box-shadows and border highlights\n`;
    enhancedPrompt += `- Clean, minimal design with plenty of white space\n`;
    enhancedPrompt += `- Modern sleek aesthetic with subtle gradients\n`;
    enhancedPrompt += `- Eye-catching hover transitions and micro-interactions\n\n`;

    // Animation & State Management
    enhancedPrompt += `Animation & Interaction System:\n`;
    enhancedPrompt += `- Implement CSS keyframe animations for smooth transitions\n`;
    enhancedPrompt += `- Use CSS custom properties (variables) for dynamic theming\n`;
    enhancedPrompt += `- Add hover effects with transform: scale() and opacity changes\n`;
    enhancedPrompt += `- Include fade-in animations for content loading\n`;
    enhancedPrompt += `- Implement parallax scrolling effects where appropriate\n`;
    enhancedPrompt += `- Add subtle loading states and skeleton screens\n\n`;

    // Modern Color Palette (Glass UI)
    enhancedPrompt += `Glass UI Color System:\n`;
    enhancedPrompt += `- Primary: rgba(255, 255, 255, 0.1) for glass containers\n`;
    enhancedPrompt += `- Secondary: rgba(255, 255, 255, 0.05) for nested elements\n`;
    enhancedPrompt += `- Accent: #3B82F6 or #8B5CF6 for interactive elements\n`;
    enhancedPrompt += `- Text: rgba(255, 255, 255, 0.9) for primary text\n`;
    enhancedPrompt += `- Text Secondary: rgba(255, 255, 255, 0.6) for secondary text\n`;
    enhancedPrompt += `- Background: Linear gradients with dark themes\n\n`;

    // Add user preferences
    if (userPrefs) {
      if (userPrefs.color_preferences) {
        enhancedPrompt += `User Preferences - Colors: ${userPrefs.color_preferences.primary}, ${userPrefs.color_preferences.secondary}\n`;
      }
      if (userPrefs.preferred_styles?.length > 0) {
        enhancedPrompt += `User Preferences - Styles: ${userPrefs.preferred_styles.join(', ')}\n`;
      }
    }

    // Professional React/TypeScript Structure
    enhancedPrompt += `Code Structure Requirements:\n`;
    enhancedPrompt += `- Write in React + TypeScript syntax initially\n`;
    enhancedPrompt += `- Use functional components with hooks (useState, useEffect)\n`;
    enhancedPrompt += `- Implement proper TypeScript interfaces for props\n`;
    enhancedPrompt += `- Create reusable component patterns\n`;
    enhancedPrompt += `- Convert to vanilla JavaScript for final output\n`;
    enhancedPrompt += `- Include comprehensive CSS animations and transitions\n\n`;

    // Add component suggestions with glass UI focus
    enhancedPrompt += `Recommended Glass UI Components:\n`;
    enhancedPrompt += `- Glass cards with backdrop-filter and rounded corners\n`;
    enhancedPrompt += `- Floating navigation with glass morphism\n`;
    enhancedPrompt += `- Animated buttons with glass surface effects\n`;
    enhancedPrompt += `- Modal overlays with blurred backgrounds\n`;
    enhancedPrompt += `- Progress indicators with glass styling\n`;
    enhancedPrompt += `- Form inputs with glass container aesthetics\n\n`;

    enhancedPrompt += `Output Format: Generate complete HTML with embedded CSS and JavaScript that renders a stunning glass UI template with smooth animations and state management. The code should be clean, modern, and immediately renderable.`;

    return enhancedPrompt;
  }  /**
   * Get learning insights to improve AI behavior
   */
  async getLearningInsights(type?: string): Promise<LearningInsight[]> {
    let insights = [...this.learningInsights];
    
    if (type) {
      insights = insights.filter(i => i.insight_type === type);
    }
    
    return insights.sort((a, b) => b.confidence_score - a.confidence_score);
  }

  /**
   * Get user design preferences to personalize templates
   */
  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    return this.userPreferences.get(userId) || null;
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('ai_learning_data');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.userPreferences) {
          this.userPreferences = new Map(data.userPreferences);
        }
        if (data.learningInsights) {
          this.learningInsights = data.learningInsights;
        }
      }
    } catch (error) {
      console.warn('Failed to load AI learning data from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = {
        userPreferences: Array.from(this.userPreferences.entries()),
        learningInsights: this.learningInsights
      };
      localStorage.setItem('ai_learning_data', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save AI learning data to storage:', error);
    }
  }

  private getModernSaaSTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Modern SaaS Landing</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
    <nav class="fixed w-full z-50 bg-white/10 backdrop-blur-md border-b border-white/10">
        <div class="max-w-7xl mx-auto px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <span class="text-xl font-bold">SaaSify</span>
                <div class="hidden md:flex items-center space-x-8">
                    <a href="#features" class="text-gray-300 hover:text-white transition-colors">Features</a>
                    <button class="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2 rounded-full">Get Started</button>
                </div>
            </div>
        </div>
    </nav>
    <section class="pt-32 pb-20 px-6">
        <div class="max-w-7xl mx-auto text-center">
            <h1 class="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                Build Better Products
            </h1>
            <p class="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
                Transform your ideas into reality with our cutting-edge platform.
            </p>
        </div>
    </section>
</body>
</html>`;
  }

  private getCreativePortfolioTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Creative Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-900">
    <header class="bg-white shadow-sm sticky top-0 z-50">
        <div class="max-w-6xl mx-auto px-6 py-4">
            <nav class="flex justify-between items-center">
                <h1 class="text-2xl font-light tracking-wide">Alex Chen</h1>
                <div class="hidden md:flex space-x-8">
                    <a href="#work" class="text-gray-600 hover:text-gray-900">Work</a>
                    <a href="#about" class="text-gray-600 hover:text-gray-900">About</a>
                </div>
            </nav>
        </div>
    </header>
    <section class="py-20 px-6">
        <div class="max-w-4xl mx-auto text-center">
            <h2 class="text-6xl md:text-8xl font-light mb-8">
                Digital<br><span class="italic font-serif">Designer</span>
            </h2>
            <p class="text-xl text-gray-600 max-w-2xl mx-auto">
                Creating meaningful digital experiences through thoughtful design.
            </p>
        </div>
    </section>
</body>
</html>`;
  }

  private getAnalyticsDashboardTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Analytics Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <div class="flex h-screen">
        <div class="w-64 bg-white shadow-lg">
            <div class="p-6 border-b">
                <span class="text-xl font-semibold">Analytics</span>
            </div>
            <nav class="mt-6">
                <a href="#" class="flex items-center px-6 py-3 text-gray-700 bg-blue-50">Dashboard</a>
                <a href="#" class="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-50">Reports</a>
            </nav>
        </div>
        <div class="flex-1">
            <header class="bg-white shadow-sm border-b">
                <div class="px-6 py-4">
                    <h1 class="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
                </div>
            </header>
            <main class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div class="bg-white p-6 rounded-lg shadow-sm">
                        <p class="text-sm text-gray-600">Total Users</p>
                        <p class="text-3xl font-bold text-gray-900">24,847</p>
                    </div>
                </div>
            </main>
        </div>
    </div>
</body>
</html>`;
  }

  private getGlassMorphismLandingTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Glass Morphism Landing</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * { box-sizing: border-box; }
        
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            overflow-x: hidden;
        }
        
        .glass-container {
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, 0.1);
            border-radius: 24px;
            border: 1px solid rgba(255, 255, 255, 0.18);
            box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
            animation: fadeInUp 0.8s ease-out;
        }
        
        .glass-nav {
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            background: rgba(255, 255, 255, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .glass-card {
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            background: rgba(255, 255, 255, 0.08);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 4px 24px 0 rgba(31, 38, 135, 0.25);
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .glass-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 60px 0 rgba(31, 38, 135, 0.5);
        }
        
        .glass-button {
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.15);
            border: 1px solid rgba(255, 255, 255, 0.3);
            transition: all 0.3s ease;
            cursor: pointer;
        }
        
        .glass-button:hover {
            background: rgba(255, 255, 255, 0.25);
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }
        
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
    </style>
</head>
<body>
    <nav class="glass-nav fixed w-full z-50 px-6 py-4">
        <div class="max-w-7xl mx-auto flex justify-between items-center">
            <div class="text-2xl font-bold text-white">GlassUI</div>
            <div class="hidden md:flex items-center space-x-8">
                <a href="#" class="text-gray-200 hover:text-white transition-colors">Features</a>
                <a href="#" class="text-gray-200 hover:text-white transition-colors">About</a>
                <button class="glass-button px-6 py-2 rounded-full text-white font-medium">Get Started</button>
            </div>
        </div>
    </nav>
    
    <div class="min-h-screen pt-20 p-6 flex items-center justify-center">
        <div class="glass-container max-w-6xl w-full p-12 text-center">
            <h1 class="text-6xl md:text-7xl font-bold text-white mb-8 animate-float">
                Beautiful Glass UI
            </h1>
            <p class="text-xl text-gray-200 mb-12 max-w-3xl mx-auto">
                Experience the future of web design with stunning glass morphism effects and smooth animations
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
                <div class="glass-card p-8">
                    <div class="text-4xl mb-6">✨</div>
                    <h3 class="text-2xl font-semibold text-white mb-4">Glass Effects</h3>
                    <p class="text-gray-200">Beautiful backdrop filters and transparency effects</p>
                </div>
                
                <div class="glass-card p-8">
                    <div class="text-4xl mb-6">🎨</div>
                    <h3 class="text-2xl font-semibold text-white mb-4">Smooth Animations</h3>
                    <p class="text-gray-200">Fluid transitions and interactive hover states</p>
                </div>
                
                <div class="glass-card p-8">
                    <div class="text-4xl mb-6">⚡</div>
                    <h3 class="text-2xl font-semibold text-white mb-4">Modern Design</h3>
                    <p class="text-gray-200">Clean, contemporary aesthetic with depth</p>
                </div>
            </div>
            
            <div class="mt-16">
                <button class="glass-button px-12 py-4 text-xl font-semibold text-white rounded-full">
                    Start Building
                </button>
            </div>
        </div>
    </div>
    
    <script>
        // Dynamic background animation
        let angle = 0;
        setInterval(() => {
            angle += 0.5;
            const gradientAngle = 135 + Math.sin(angle * 0.01) * 15;
            const color1 = 'hsl(' + (220 + Math.cos(angle * 0.008) * 30) + ', 70%, 65%)';
            const color2 = 'hsl(' + (280 + Math.sin(angle * 0.006) * 30) + ', 60%, 55%)';
            document.body.style.background = 'linear-gradient(' + gradientAngle + 'deg, ' + color1 + ' 0%, ' + color2 + ' 100%)';
        }, 100);
    </script>
</body>
</html>`;
  }

  private getAnimatedGlassPortfolioTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Animated Glass Portfolio</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;400;500;600&display=swap');
        
        body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            background: linear-gradient(45deg, #12c2e9, #c471ed, #f64f59);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
            min-height: 100vh;
        }
        
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        
        .glass-portfolio {
            backdrop-filter: blur(25px);
            background: rgba(255, 255, 255, 0.1);
            border-radius: 30px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
        }
        
        .portfolio-card {
            backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            position: relative;
            overflow: hidden;
        }
        
        .portfolio-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transition: left 0.8s;
        }
        
        .portfolio-card:hover::before {
            left: 100%;
        }
        
        .portfolio-card:hover {
            transform: translateY(-15px) rotateX(5deg);
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.2);
        }
        
        .text-glow {
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
        }
    </style>
</head>
<body>
    <div class="min-h-screen p-8">
        <div class="glass-portfolio max-w-7xl mx-auto p-12">
            <div class="text-center mb-16">
                <h1 class="text-7xl font-extralight text-white text-glow mb-6">
                    Creative Portfolio
                </h1>
                <p class="text-2xl text-gray-200 font-light">
                    Stunning work with glass morphism design
                </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div class="portfolio-card p-8 h-80 flex flex-col justify-end">
                    <h3 class="text-2xl font-medium text-white mb-2">Project Alpha</h3>
                    <p class="text-gray-300">Modern web application with stunning animations</p>
                </div>
                
                <div class="portfolio-card p-8 h-80 flex flex-col justify-end">
                    <h3 class="text-2xl font-medium text-white mb-2">Brand Design</h3>
                    <p class="text-gray-300">Complete brand identity with glass aesthetics</p>
                </div>
                
                <div class="portfolio-card p-8 h-80 flex flex-col justify-end">
                    <h3 class="text-2xl font-medium text-white mb-2">UI/UX Study</h3>
                    <p class="text-gray-300">User interface design with depth and clarity</p>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  private getGlassDashboardTemplate(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Glass Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            background: linear-gradient(135deg, #4F46E5 0%, #06B6D4 50%, #10B981 100%);
            min-height: 100vh;
        }
        
        .glass-sidebar {
            backdrop-filter: blur(20px);
            background: rgba(255, 255, 255, 0.05);
            border-right: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .glass-panel {
            backdrop-filter: blur(15px);
            background: rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            transition: all 0.3s ease;
        }
        
        .glass-panel:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
        }
        
        .stat-card {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            transition: transform 0.2s ease;
        }
        
        .stat-card:hover {
            transform: scale(1.05);
        }
    </style>
</head>
<body>
    <div class="flex h-screen">
        <div class="glass-sidebar w-64 p-6">
            <div class="text-2xl font-bold text-white mb-8">Dashboard</div>
            <nav class="space-y-2">
                <a href="#" class="block px-4 py-3 text-white bg-white/10 rounded-lg">Overview</a>
                <a href="#" class="block px-4 py-3 text-gray-200 hover:bg-white/5 rounded-lg transition-colors">Analytics</a>
                <a href="#" class="block px-4 py-3 text-gray-200 hover:bg-white/5 rounded-lg transition-colors">Reports</a>
            </nav>
        </div>
        
        <div class="flex-1 p-8">
            <div class="glass-panel p-6 mb-8">
                <h1 class="text-3xl font-semibold text-white">Dashboard Overview</h1>
                <p class="text-gray-200 mt-2">Welcome back to your glass dashboard</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="stat-card p-6">
                    <div class="text-3xl font-bold text-white">2,847</div>
                    <div class="text-gray-200 text-sm">Total Users</div>
                </div>
                <div class="stat-card p-6">
                    <div class="text-3xl font-bold text-white">$12.5k</div>
                    <div class="text-gray-200 text-sm">Revenue</div>
                </div>
                <div class="stat-card p-6">
                    <div class="text-3xl font-bold text-white">94.2%</div>
                    <div class="text-gray-200 text-sm">Uptime</div>
                </div>
                <div class="stat-card p-6">
                    <div class="text-3xl font-bold text-white">156</div>
                    <div class="text-gray-200 text-sm">Projects</div>
                </div>
            </div>
            
            <div class="glass-panel p-8">
                <h2 class="text-2xl font-semibold text-white mb-6">Recent Activity</h2>
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <span class="text-white">New user registration</span>
                        <span class="text-gray-300 text-sm">2 min ago</span>
                    </div>
                    <div class="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <span class="text-white">Payment processed</span>
                        <span class="text-gray-300 text-sm">5 min ago</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Record generation history for learning
   */
  async recordGeneration(
    prompt: string,
    generatedCode: string,
    userId?: string,
    category?: string,
    designStyle?: string,
    templatePatternId?: string,
    generationMethod: 'from_scratch' | 'based_on_pattern' | 'iteration' = 'from_scratch',
    executionTimeMs: number = 0,
    tokensUsed: number = 0
  ): Promise<string> {
    if (!userId) return '';

    const generationId = uuidv4();
    
    // Store in memory/localStorage for now
    console.log('AI Generation recorded:', {
      id: generationId,
      userId,
      prompt,
      category,
      designStyle,
      generationMethod,
      executionTimeMs
    });

    return generationId;
  }

  /**
   * Submit user feedback to improve AI learning
   */
  async submitFeedback(feedback: UserFeedback, userId: string): Promise<void> {
    console.log('AI Feedback submitted:', { feedback, userId });
    
    // Update learning insights based on feedback
    await this.updateLearningInsights(feedback);
    
    // Save to storage
    this.saveToStorage();
  }

  /**
   * Update user design preferences based on their choices
   */
  async updateUserPreferences(
    userId: string,
    preferences: UserPreferences
  ): Promise<void> {
    const existingPrefs = this.userPreferences.get(userId) || {};
    const updatedPrefs = { ...existingPrefs, ...preferences };
    
    this.userPreferences.set(userId, updatedPrefs);
    this.saveToStorage();
  }

  /**
   * Get similar templates based on success patterns
   */
  async getSimilarSuccessfulTemplates(
    category?: string,
    designStyle?: string,
    limit: number = 5
  ): Promise<TemplatePattern[]> {
    let templates = [...this.templatePatterns];
    if (category) {
      templates = templates.filter(p => p.category === category);
    }
    if (designStyle) {
      templates = templates.filter(p => p.design_style === designStyle);
    }
    templates = templates.filter(p => p.success_rating >= 4.0);
    return templates.slice(0, limit);
  }

  /**
   * Analyze and learn from successful generations
   */
  async analyzeSuccessfulPatterns(): Promise<void> {
    // For now, this is a placeholder - in a real implementation,
    // this would analyze user feedback and update learning insights
    console.log('Analyzing successful patterns...');
  }

  private async getNextGenerationNumber(): Promise<number> {
    // Simple increment for session
    return 1;
  }

  private async updateLearningInsights(feedback: UserFeedback): Promise<void> {
    if (feedback.rating >= 4 && feedback.helpful_elements) {
      // Create positive learning insight
      const insight: Partial<LearningInsight> = {
        insight_type: 'user_preference',
        pattern_data: {
          helpful_elements: feedback.helpful_elements,
          feedback_type: feedback.feedback_type,
          rating: feedback.rating
        },
        confidence_score: feedback.rating / 5,
        usage_count: 1,
        success_rate: 1.0
      };

      await this.upsertLearningInsight(insight);
    }
  }

  private extractPatterns(generations: GenerationHistory[]): Partial<LearningInsight>[] {
    // Implementation to extract common patterns from successful generations
    // This would analyze common elements, structures, styles, etc.
    return [];
  }

  private async upsertLearningInsight(insight: Partial<LearningInsight>): Promise<void> {
    // Store in memory for now
    console.log('Learning insight:', insight);
  }

  /**
   * Get recommended templates based on user history and preferences
   */
  async getRecommendedTemplates(userId: string, limit: number = 10): Promise<TemplatePattern[]> {
    const userPrefs = await this.getUserPreferences(userId);
    
    const filters: {
      min_rating: number;
      design_style?: string;
      category?: string;
    } = { min_rating: 3.0 };
    
    if (userPrefs?.preferred_styles?.length > 0) {
      // For now, pick the first preferred style
      // In a more sophisticated system, we'd weight by all preferences
      filters.design_style = userPrefs.preferred_styles[0];
    }
    
    if (userPrefs?.preferred_categories?.length > 0) {
      filters.category = userPrefs.preferred_categories[0];
    }

    let templates = [...this.templatePatterns];
    
    if (filters.category) {
      templates = templates.filter(p => p.category === filters.category);
    }
    if (filters.design_style) {
      templates = templates.filter(p => p.design_style === filters.design_style);
    }
    if (filters.min_rating !== undefined) {
      templates = templates.filter(p => p.success_rating >= filters.min_rating);
    }
    
    return templates.slice(0, limit);
  }
}

export const aiLearningService = new AILearningService();