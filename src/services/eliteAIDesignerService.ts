/**
 * Elite AI Designer Service
 * Professional webpage generation using VanillaJS + TailwindCSS
 * Prevents element overlap with robust layout architecture
 */

import type { UserIntent, DesignTheme, OrganismType } from '@/types/designSystem';
import { getThemeByMood } from '@/utils/designTokens';

/**
 * Professional HTML Component with proper spacing
 */
export interface HTMLComponent {
  tag: string;
  classes: string[];
  attributes: Record<string, string>;
  content?: string;
  children?: HTMLComponent[];
  style?: Record<string, string>;
}

/**
 * Section Layout Configuration
 */
export interface SectionLayout {
  container: string; // Container classes
  wrapper: string; // Inner wrapper classes
  grid?: string; // Grid/flex classes
  spacing: {
    padding: string;
    margin: string;
    gap: string;
  };
}

/**
 * Elite Website Structure
 */
export interface EliteWebsite {
  html: string;
  css: string; // Additional custom CSS if needed
  js: string; // VanillaJS for interactions
  meta: {
    title: string;
    description: string;
    viewport: string;
  };
}

/**
 * Elite AI Designer Service
 * Generates professional, pixel-perfect websites
 */
export class EliteAIDesignerService {
  
  /**
   * Generate complete website from user intent
   */
  static generateWebsite(intent: UserIntent): EliteWebsite {
    const theme = getThemeByMood(intent.style?.mood || 'corporate');
    
    // Generate sections with proper spacing
    const sections = intent.sections.map((sectionType) => 
      this.generateSection(sectionType, theme)
    );
    
    // Build complete HTML
    const html = this.buildHTML(sections, theme, intent);
    
    // Generate interactions
    const js = this.generateJavaScript(intent.sections);
    
    return {
      html,
      css: '', // TailwindCSS handles styling
      js,
      meta: {
        title: `${intent.domain.charAt(0).toUpperCase() + intent.domain.slice(1)} - Professional Website`,
        description: `Professional ${intent.domain} website`,
        viewport: 'width=device-width, initial-scale=1.0'
      }
    };
  }
  
  /**
   * Generate section with professional layout
   */
  private static generateSection(type: OrganismType, theme: DesignTheme): string {
    const sectionMap: Record<OrganismType, () => string> = {
      'hero': () => this.generateHeroSection(theme),
      'navigation': () => this.generateNavigationSection(theme),
      'footer': () => this.generateFooterSection(theme),
      'features': () => this.generateFeaturesSection(theme),
      'gallery': () => this.generateGallerySection(theme),
      'testimonials': () => this.generateTestimonialsSection(theme),
      'pricing': () => this.generatePricingSection(theme),
      'contact': () => this.generateContactSection(theme),
      'about': () => this.generateAboutSection(theme),
      'team': () => this.generateTeamSection(theme),
      'blog': () => this.generateBlogSection(theme),
      'cta': () => this.generateCTASection(theme)
    };
    
    return sectionMap[type]?.() || '';
  }
  
  /**
   * Generate Hero Section - Professional, no overlap
   */
  private static generateHeroSection(theme: DesignTheme): string {
    const primaryColors = theme.tokens.colors.primary;
    const bgColor = this.getColorClass(primaryColors[5]?.value || '#3B82F6', 'bg');
    const textColor = theme.colorScheme === 'dark' ? 'text-white' : 'text-gray-900';
    
    return `
<!-- Hero Section - Professional Layout -->
<section class="relative w-full min-h-screen flex items-center justify-center ${bgColor} overflow-hidden">
  <!-- Background Decoration -->
  <div class="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent pointer-events-none"></div>
  
  <!-- Container with proper constraints -->
  <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div class="flex flex-col items-center text-center space-y-8 py-16 sm:py-24">
      
      <!-- Heading - Properly spaced -->
      <h1 class="${textColor} text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight max-w-4xl">
        Transform Your Digital Presence
      </h1>
      
      <!-- Subheading - Clear separation -->
      <p class="${textColor} text-lg sm:text-xl md:text-2xl opacity-90 max-w-2xl leading-relaxed">
        Professional solutions designed for modern businesses. Built with precision and care.
      </p>
      
      <!-- CTA Buttons - Proper spacing -->
      <div class="flex flex-col sm:flex-row gap-4 sm:gap-6 pt-8">
        <button class="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
          Get Started
        </button>
        <button class="px-8 py-4 border-2 border-white ${textColor} rounded-lg font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300">
          Learn More
        </button>
      </div>
      
    </div>
  </div>
  
  <!-- Scroll Indicator -->
  <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
    <svg class="${textColor} w-6 h-6 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
    </svg>
  </div>
</section>`;
  }
  
  /**
   * Generate Navigation Section - Fixed, no overlap
   */
  private static generateNavigationSection(theme: DesignTheme): string {
    const bgColor = theme.colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white';
    const textColor = theme.colorScheme === 'dark' ? 'text-white' : 'text-gray-900';
    
    return `
<!-- Navigation - Fixed Header -->
<nav class="fixed top-0 left-0 right-0 z-50 ${bgColor} border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm bg-opacity-90">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div class="flex items-center justify-between h-16 sm:h-20">
      
      <!-- Logo -->
      <div class="flex-shrink-0">
        <a href="#" class="${textColor} text-xl sm:text-2xl font-bold hover:opacity-80 transition-opacity">
          YourBrand
        </a>
      </div>
      
      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center space-x-8">
        <a href="#features" class="${textColor} hover:opacity-70 transition-opacity font-medium">Features</a>
        <a href="#about" class="${textColor} hover:opacity-70 transition-opacity font-medium">About</a>
        <a href="#pricing" class="${textColor} hover:opacity-70 transition-opacity font-medium">Pricing</a>
        <a href="#contact" class="${textColor} hover:opacity-70 transition-opacity font-medium">Contact</a>
      </div>
      
      <!-- Mobile Menu Button -->
      <button id="mobile-menu-btn" class="md:hidden ${textColor} p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
      
    </div>
  </div>
  
  <!-- Mobile Menu - Hidden by default -->
  <div id="mobile-menu" class="hidden md:hidden border-t border-gray-200 dark:border-gray-800">
    <div class="container mx-auto px-4 py-4 space-y-2">
      <a href="#features" class="block ${textColor} py-2 hover:opacity-70 transition-opacity">Features</a>
      <a href="#about" class="block ${textColor} py-2 hover:opacity-70 transition-opacity">About</a>
      <a href="#pricing" class="block ${textColor} py-2 hover:opacity-70 transition-opacity">Pricing</a>
      <a href="#contact" class="block ${textColor} py-2 hover:opacity-70 transition-opacity">Contact</a>
    </div>
  </div>
</nav>

<!-- Spacer to prevent content from hiding under fixed nav -->
<div class="h-16 sm:h-20"></div>`;
  }
  
  /**
   * Generate Features Section - Grid without overlap
   */
  private static generateFeaturesSection(theme: DesignTheme): string {
    const bgColor = theme.colorScheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    const textColor = theme.colorScheme === 'dark' ? 'text-white' : 'text-gray-900';
    const cardBg = theme.colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';
    
    return `
<!-- Features Section - Professional Grid -->
<section id="features" class="relative w-full ${bgColor} py-16 sm:py-24">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    
    <!-- Section Header -->
    <div class="text-center mb-12 sm:mb-16 space-y-4">
      <h2 class="${textColor} text-3xl sm:text-4xl md:text-5xl font-bold">
        Powerful Features
      </h2>
      <p class="${textColor} opacity-70 text-lg sm:text-xl max-w-2xl mx-auto">
        Everything you need to succeed, all in one place
      </p>
    </div>
    
    <!-- Features Grid - No Overlap -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      
      <!-- Feature Card 1 -->
      <div class="${cardBg} rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700">
        <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6">
          <svg class="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
        </div>
        <h3 class="${textColor} text-xl sm:text-2xl font-bold mb-4">Lightning Fast</h3>
        <p class="${textColor} opacity-70 text-base leading-relaxed">
          Optimized performance ensures your website loads instantly, keeping visitors engaged.
        </p>
      </div>
      
      <!-- Feature Card 2 -->
      <div class="${cardBg} rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700">
        <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6">
          <svg class="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <h3 class="${textColor} text-xl sm:text-2xl font-bold mb-4">Secure & Safe</h3>
        <p class="${textColor} opacity-70 text-base leading-relaxed">
          Enterprise-grade security keeps your data protected with industry-leading standards.
        </p>
      </div>
      
      <!-- Feature Card 3 -->
      <div class="${cardBg} rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700">
        <div class="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6">
          <svg class="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
          </svg>
        </div>
        <h3 class="${textColor} text-xl sm:text-2xl font-bold mb-4">Fully Responsive</h3>
        <p class="${textColor} opacity-70 text-base leading-relaxed">
          Perfect display on any device - from mobile phones to ultra-wide monitors.
        </p>
      </div>
      
    </div>
    
  </div>
</section>`;
  }
  
  /**
   * Generate Gallery Section - Masonry layout without overlap
   */
  private static generateGallerySection(theme: DesignTheme): string {
    const bgColor = theme.colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = theme.colorScheme === 'dark' ? 'text-white' : 'text-gray-900';
    
    return `
<!-- Gallery Section - Masonry Grid -->
<section id="gallery" class="relative w-full ${bgColor} py-16 sm:py-24">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    
    <!-- Section Header -->
    <div class="text-center mb-12 sm:mb-16 space-y-4">
      <h2 class="${textColor} text-3xl sm:text-4xl md:text-5xl font-bold">
        Our Portfolio
      </h2>
      <p class="${textColor} opacity-70 text-lg sm:text-xl max-w-2xl mx-auto">
        Showcasing excellence in every project
      </p>
    </div>
    
    <!-- Gallery Grid - Responsive, No Overlap -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      
      <!-- Gallery Item 1 -->
      <div class="relative group overflow-hidden rounded-2xl aspect-square">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600"></div>
        <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span class="text-white text-xl font-semibold">Project One</span>
        </div>
      </div>
      
      <!-- Gallery Item 2 -->
      <div class="relative group overflow-hidden rounded-2xl aspect-square">
        <div class="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-600"></div>
        <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span class="text-white text-xl font-semibold">Project Two</span>
        </div>
      </div>
      
      <!-- Gallery Item 3 -->
      <div class="relative group overflow-hidden rounded-2xl aspect-square">
        <div class="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600"></div>
        <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span class="text-white text-xl font-semibold">Project Three</span>
        </div>
      </div>
      
      <!-- Gallery Item 4 -->
      <div class="relative group overflow-hidden rounded-2xl aspect-square">
        <div class="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-600"></div>
        <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span class="text-white text-xl font-semibold">Project Four</span>
        </div>
      </div>
      
      <!-- Gallery Item 5 -->
      <div class="relative group overflow-hidden rounded-2xl aspect-square">
        <div class="absolute inset-0 bg-gradient-to-br from-indigo-500 to-blue-600"></div>
        <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span class="text-white text-xl font-semibold">Project Five</span>
        </div>
      </div>
      
      <!-- Gallery Item 6 -->
      <div class="relative group overflow-hidden rounded-2xl aspect-square">
        <div class="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-600"></div>
        <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span class="text-white text-xl font-semibold">Project Six</span>
        </div>
      </div>
      
    </div>
    
  </div>
</section>`;
  }
  
  /**
   * Generate Testimonials Section - Card layout without overlap
   */
  private static generateTestimonialsSection(theme: DesignTheme): string {
    const bgColor = theme.colorScheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    const textColor = theme.colorScheme === 'dark' ? 'text-white' : 'text-gray-900';
    const cardBg = theme.colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';
    
    return `
<!-- Testimonials Section - Proper Card Spacing -->
<section id="testimonials" class="relative w-full ${bgColor} py-16 sm:py-24">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    
    <!-- Section Header -->
    <div class="text-center mb-12 sm:mb-16 space-y-4">
      <h2 class="${textColor} text-3xl sm:text-4xl md:text-5xl font-bold">
        What Clients Say
      </h2>
      <p class="${textColor} opacity-70 text-lg sm:text-xl max-w-2xl mx-auto">
        Trusted by thousands of satisfied customers worldwide
      </p>
    </div>
    
    <!-- Testimonials Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      
      <!-- Testimonial Card 1 -->
      <div class="${cardBg} rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
        <div class="flex items-center mb-6 space-x-1">
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        </div>
        <p class="${textColor} opacity-80 text-base leading-relaxed mb-6 flex-grow">
          "Outstanding service! The team delivered beyond our expectations. Professional, responsive, and truly dedicated to our success."
        </p>
        <div class="flex items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0"></div>
          <div>
            <p class="${textColor} font-semibold text-base">Sarah Johnson</p>
            <p class="${textColor} opacity-60 text-sm">CEO, TechCorp</p>
          </div>
        </div>
      </div>
      
      <!-- Testimonial Card 2 -->
      <div class="${cardBg} rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
        <div class="flex items-center mb-6 space-x-1">
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        </div>
        <p class="${textColor} opacity-80 text-base leading-relaxed mb-6 flex-grow">
          "Incredible attention to detail. The final product exceeded all our expectations and our customers love it!"
        </p>
        <div class="flex items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex-shrink-0"></div>
          <div>
            <p class="${textColor} font-semibold text-base">Michael Chen</p>
            <p class="${textColor} opacity-60 text-sm">Founder, StartupXYZ</p>
          </div>
        </div>
      </div>
      
      <!-- Testimonial Card 3 -->
      <div class="${cardBg} rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col">
        <div class="flex items-center mb-6 space-x-1">
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
          <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
        </div>
        <p class="${textColor} opacity-80 text-base leading-relaxed mb-6 flex-grow">
          "Best investment we've made. Fast, reliable, and the results speak for themselves. Highly recommended!"
        </p>
        <div class="flex items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex-shrink-0"></div>
          <div>
            <p class="${textColor} font-semibold text-base">Emily Rodriguez</p>
            <p class="${textColor} opacity-60 text-sm">Director, Creative Agency</p>
          </div>
        </div>
      </div>
      
    </div>
    
  </div>
</section>`;
  }
  
  /**
   * Generate Pricing Section - Professional pricing cards
   */
  private static generatePricingSection(theme: DesignTheme): string {
    const bgColor = theme.colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = theme.colorScheme === 'dark' ? 'text-white' : 'text-gray-900';
    const cardBg = theme.colorScheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    
    return `
<!-- Pricing Section - Clean Card Layout -->
<section id="pricing" class="relative w-full ${bgColor} py-16 sm:py-24">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    
    <!-- Section Header -->
    <div class="text-center mb-12 sm:mb-16 space-y-4">
      <h2 class="${textColor} text-3xl sm:text-4xl md:text-5xl font-bold">
        Simple Pricing
      </h2>
      <p class="${textColor} opacity-70 text-lg sm:text-xl max-w-2xl mx-auto">
        Choose the perfect plan for your needs
      </p>
    </div>
    
    <!-- Pricing Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
      
      <!-- Basic Plan -->
      <div class="${cardBg} rounded-2xl p-6 sm:p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col">
        <h3 class="${textColor} text-2xl font-bold mb-2">Basic</h3>
        <p class="${textColor} opacity-60 text-sm mb-6">Perfect for getting started</p>
        <div class="mb-6">
          <span class="${textColor} text-5xl font-bold">$29</span>
          <span class="${textColor} opacity-60 text-lg">/month</span>
        </div>
        <ul class="space-y-4 mb-8 flex-grow">
          <li class="${textColor} opacity-80 text-base flex items-start">
            <svg class="w-6 h-6 text-green-500 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Up to 5 projects</span>
          </li>
          <li class="${textColor} opacity-80 text-base flex items-start">
            <svg class="w-6 h-6 text-green-500 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Basic support</span>
          </li>
          <li class="${textColor} opacity-80 text-base flex items-start">
            <svg class="w-6 h-6 text-green-500 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>1GB storage</span>
          </li>
        </ul>
        <button class="w-full py-4 px-6 bg-gray-200 dark:bg-gray-700 ${textColor} rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300">
          Get Started
        </button>
      </div>
      
      <!-- Pro Plan (Featured) -->
      <div class="relative ${cardBg} rounded-2xl p-6 sm:p-8 border-2 border-blue-500 hover:border-blue-600 transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col">
        <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
          POPULAR
        </div>
        <h3 class="${textColor} text-2xl font-bold mb-2">Pro</h3>
        <p class="${textColor} opacity-60 text-sm mb-6">For growing businesses</p>
        <div class="mb-6">
          <span class="${textColor} text-5xl font-bold">$79</span>
          <span class="${textColor} opacity-60 text-lg">/month</span>
        </div>
        <ul class="space-y-4 mb-8 flex-grow">
          <li class="${textColor} opacity-80 text-base flex items-start">
            <svg class="w-6 h-6 text-green-500 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Unlimited projects</span>
          </li>
          <li class="${textColor} opacity-80 text-base flex items-start">
            <svg class="w-6 h-6 text-green-500 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Priority support</span>
          </li>
          <li class="${textColor} opacity-80 text-base flex items-start">
            <svg class="w-6 h-6 text-green-500 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>10GB storage</span>
          </li>
          <li class="${textColor} opacity-80 text-base flex items-start">
            <svg class="w-6 h-6 text-green-500 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Advanced analytics</span>
          </li>
        </ul>
        <button class="w-full py-4 px-6 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl">
          Get Started
        </button>
      </div>
      
      <!-- Enterprise Plan -->
      <div class="${cardBg} rounded-2xl p-6 sm:p-8 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-all duration-300 hover:scale-105 hover:shadow-2xl flex flex-col">
        <h3 class="${textColor} text-2xl font-bold mb-2">Enterprise</h3>
        <p class="${textColor} opacity-60 text-sm mb-6">For large organizations</p>
        <div class="mb-6">
          <span class="${textColor} text-5xl font-bold">$199</span>
          <span class="${textColor} opacity-60 text-lg">/month</span>
        </div>
        <ul class="space-y-4 mb-8 flex-grow">
          <li class="${textColor} opacity-80 text-base flex items-start">
            <svg class="w-6 h-6 text-green-500 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Unlimited everything</span>
          </li>
          <li class="${textColor} opacity-80 text-base flex items-start">
            <svg class="w-6 h-6 text-green-500 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>24/7 dedicated support</span>
          </li>
          <li class="${textColor} opacity-80 text-base flex items-start">
            <svg class="w-6 h-6 text-green-500 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Unlimited storage</span>
          </li>
          <li class="${textColor} opacity-80 text-base flex items-start">
            <svg class="w-6 h-6 text-green-500 flex-shrink-0 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Custom integrations</span>
          </li>
        </ul>
        <button class="w-full py-4 px-6 bg-gray-200 dark:bg-gray-700 ${textColor} rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300">
          Contact Sales
        </button>
      </div>
      
    </div>
    
  </div>
</section>`;
  }
  
  /**
   * Generate Contact Section - Professional contact form
   */
  private static generateContactSection(theme: DesignTheme): string {
    const bgColor = theme.colorScheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    const textColor = theme.colorScheme === 'dark' ? 'text-white' : 'text-gray-900';
    const cardBg = theme.colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const inputBg = theme.colorScheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';
    
    return `
<!-- Contact Section - Professional Form Layout -->
<section id="contact" class="relative w-full ${bgColor} py-16 sm:py-24">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    
    <!-- Section Header -->
    <div class="text-center mb-12 sm:mb-16 space-y-4">
      <h2 class="${textColor} text-3xl sm:text-4xl md:text-5xl font-bold">
        Get In Touch
      </h2>
      <p class="${textColor} opacity-70 text-lg sm:text-xl max-w-2xl mx-auto">
        Have a question? We'd love to hear from you.
      </p>
    </div>
    
    <div class="max-w-4xl mx-auto">
      <div class="${cardBg} rounded-2xl p-6 sm:p-10 shadow-xl border border-gray-200 dark:border-gray-700">
        <form class="space-y-6">
          
          <!-- Name & Email Row -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="${textColor} text-sm font-semibold">Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                class="w-full px-4 py-3 ${inputBg} ${textColor} rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              >
            </div>
            <div class="space-y-2">
              <label class="${textColor} text-sm font-semibold">Email</label>
              <input 
                type="email" 
                placeholder="john@example.com" 
                class="w-full px-4 py-3 ${inputBg} ${textColor} rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              >
            </div>
          </div>
          
          <!-- Subject -->
          <div class="space-y-2">
            <label class="${textColor} text-sm font-semibold">Subject</label>
            <input 
              type="text" 
              placeholder="How can we help?" 
              class="w-full px-4 py-3 ${inputBg} ${textColor} rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            >
          </div>
          
          <!-- Message -->
          <div class="space-y-2">
            <label class="${textColor} text-sm font-semibold">Message</label>
            <textarea 
              rows="6" 
              placeholder="Tell us about your project..." 
              class="w-full px-4 py-3 ${inputBg} ${textColor} rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
            ></textarea>
          </div>
          
          <!-- Submit Button -->
          <button 
            type="submit" 
            class="w-full py-4 px-6 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Send Message
          </button>
          
        </form>
      </div>
    </div>
    
  </div>
</section>`;
  }
  
  /**
   * Generate About Section - Content with image
   */
  private static generateAboutSection(theme: DesignTheme): string {
    const bgColor = theme.colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = theme.colorScheme === 'dark' ? 'text-white' : 'text-gray-900';
    
    return `
<!-- About Section - Content + Image Layout -->
<section id="about" class="relative w-full ${bgColor} py-16 sm:py-24">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      
      <!-- Content -->
      <div class="space-y-6">
        <h2 class="${textColor} text-3xl sm:text-4xl md:text-5xl font-bold leading-tight">
          We Build Digital Excellence
        </h2>
        <p class="${textColor} opacity-70 text-lg leading-relaxed">
          With over 10 years of experience, we've helped hundreds of businesses transform their digital presence. Our team of experts combines creativity with technical excellence to deliver solutions that drive results.
        </p>
        <p class="${textColor} opacity-70 text-lg leading-relaxed">
          From startups to enterprises, we've worked with clients across industries to create exceptional digital experiences that engage users and achieve business goals.
        </p>
        <div class="flex flex-wrap gap-4 pt-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <div>
              <p class="${textColor} font-semibold">10+ Years</p>
              <p class="${textColor} opacity-60 text-sm">Experience</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div>
              <p class="${textColor} font-semibold">500+ Clients</p>
              <p class="${textColor} opacity-60 text-sm">Worldwide</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Image Placeholder -->
      <div class="relative">
        <div class="aspect-square rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 shadow-2xl"></div>
      </div>
      
    </div>
    
  </div>
</section>`;
  }
  
  /**
   * Generate Team Section - Team member cards
   */
  private static generateTeamSection(theme: DesignTheme): string {
    const bgColor = theme.colorScheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    const textColor = theme.colorScheme === 'dark' ? 'text-white' : 'text-gray-900';
    const cardBg = theme.colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';
    
    return `
<!-- Team Section - Professional Member Cards -->
<section id="team" class="relative w-full ${bgColor} py-16 sm:py-24">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    
    <!-- Section Header -->
    <div class="text-center mb-12 sm:mb-16 space-y-4">
      <h2 class="${textColor} text-3xl sm:text-4xl md:text-5xl font-bold">
        Meet Our Team
      </h2>
      <p class="${textColor} opacity-70 text-lg sm:text-xl max-w-2xl mx-auto">
        Talented professionals dedicated to your success
      </p>
    </div>
    
    <!-- Team Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
      
      <!-- Team Member 1 -->
      <div class="${cardBg} rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105 text-center">
        <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600"></div>
        <h3 class="${textColor} text-xl font-bold mb-1">Alex Johnson</h3>
        <p class="${textColor} opacity-60 text-sm mb-4">CEO & Founder</p>
        <div class="flex justify-center space-x-3">
          <a href="#" class="${textColor} opacity-60 hover:opacity-100 transition-opacity">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
          </a>
          <a href="#" class="${textColor} opacity-60 hover:opacity-100 transition-opacity">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
          </a>
        </div>
      </div>
      
      <!-- Team Member 2 -->
      <div class="${cardBg} rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105 text-center">
        <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-purple-600"></div>
        <h3 class="${textColor} text-xl font-bold mb-1">Sarah Smith</h3>
        <p class="${textColor} opacity-60 text-sm mb-4">Lead Designer</p>
        <div class="flex justify-center space-x-3">
          <a href="#" class="${textColor} opacity-60 hover:opacity-100 transition-opacity">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
          </a>
          <a href="#" class="${textColor} opacity-60 hover:opacity-100 transition-opacity">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
          </a>
        </div>
      </div>
      
      <!-- Team Member 3 -->
      <div class="${cardBg} rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105 text-center">
        <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500 to-green-600"></div>
        <h3 class="${textColor} text-xl font-bold mb-1">Mike Davis</h3>
        <p class="${textColor} opacity-60 text-sm mb-4">Tech Lead</p>
        <div class="flex justify-center space-x-3">
          <a href="#" class="${textColor} opacity-60 hover:opacity-100 transition-opacity">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
          </a>
          <a href="#" class="${textColor} opacity-60 hover:opacity-100 transition-opacity">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
          </a>
        </div>
      </div>
      
      <!-- Team Member 4 -->
      <div class="${cardBg} rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105 text-center">
        <div class="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-500 to-orange-600"></div>
        <h3 class="${textColor} text-xl font-bold mb-1">Lisa Chen</h3>
        <p class="${textColor} opacity-60 text-sm mb-4">Marketing Director</p>
        <div class="flex justify-center space-x-3">
          <a href="#" class="${textColor} opacity-60 hover:opacity-100 transition-opacity">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
          </a>
          <a href="#" class="${textColor} opacity-60 hover:opacity-100 transition-opacity">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
          </a>
        </div>
      </div>
      
    </div>
    
  </div>
</section>`;
  }
  
  /**
   * Generate Blog Section - Blog post cards
   */
  private static generateBlogSection(theme: DesignTheme): string {
    const bgColor = theme.colorScheme === 'dark' ? 'bg-gray-800' : 'bg-white';
    const textColor = theme.colorScheme === 'dark' ? 'text-white' : 'text-gray-900';
    const cardBg = theme.colorScheme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
    
    return `
<!-- Blog Section - Article Cards -->
<section id="blog" class="relative w-full ${bgColor} py-16 sm:py-24">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    
    <!-- Section Header -->
    <div class="text-center mb-12 sm:mb-16 space-y-4">
      <h2 class="${textColor} text-3xl sm:text-4xl md:text-5xl font-bold">
        Latest Insights
      </h2>
      <p class="${textColor} opacity-70 text-lg sm:text-xl max-w-2xl mx-auto">
        Expert tips and industry insights
      </p>
    </div>
    
    <!-- Blog Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      
      <!-- Blog Post 1 -->
      <article class="${cardBg} rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <div class="aspect-video bg-gradient-to-br from-blue-500 to-purple-600"></div>
        <div class="p-6 space-y-3">
          <div class="flex items-center space-x-2 text-sm ${textColor} opacity-60">
            <span>Nov 10, 2025</span>
            <span>•</span>
            <span>5 min read</span>
          </div>
          <h3 class="${textColor} text-xl font-bold hover:text-blue-500 transition-colors">
            <a href="#">10 Design Trends for 2025</a>
          </h3>
          <p class="${textColor} opacity-70 text-base leading-relaxed">
            Discover the latest design trends shaping the digital landscape this year.
          </p>
          <a href="#" class="inline-flex items-center ${textColor} opacity-80 hover:opacity-100 font-semibold text-sm transition-opacity">
            Read More
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
      </article>
      
      <!-- Blog Post 2 -->
      <article class="${cardBg} rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <div class="aspect-video bg-gradient-to-br from-green-500 to-teal-600"></div>
        <div class="p-6 space-y-3">
          <div class="flex items-center space-x-2 text-sm ${textColor} opacity-60">
            <span>Nov 8, 2025</span>
            <span>•</span>
            <span>7 min read</span>
          </div>
          <h3 class="${textColor} text-xl font-bold hover:text-blue-500 transition-colors">
            <a href="#">Building Scalable Web Apps</a>
          </h3>
          <p class="${textColor} opacity-70 text-base leading-relaxed">
            Learn best practices for creating applications that scale with your business.
          </p>
          <a href="#" class="inline-flex items-center ${textColor} opacity-80 hover:opacity-100 font-semibold text-sm transition-opacity">
            Read More
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
      </article>
      
      <!-- Blog Post 3 -->
      <article class="${cardBg} rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <div class="aspect-video bg-gradient-to-br from-orange-500 to-red-600"></div>
        <div class="p-6 space-y-3">
          <div class="flex items-center space-x-2 text-sm ${textColor} opacity-60">
            <span>Nov 5, 2025</span>
            <span>•</span>
            <span>4 min read</span>
          </div>
          <h3 class="${textColor} text-xl font-bold hover:text-blue-500 transition-colors">
            <a href="#">The Future of AI in Design</a>
          </h3>
          <p class="${textColor} opacity-70 text-base leading-relaxed">
            Exploring how artificial intelligence is revolutionizing the design process.
          </p>
          <a href="#" class="inline-flex items-center ${textColor} opacity-80 hover:opacity-100 font-semibold text-sm transition-opacity">
            Read More
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </a>
        </div>
      </article>
      
    </div>
    
  </div>
</section>`;
  }
  
  /**
   * Generate CTA Section - Call-to-action
   */
  private static generateCTASection(theme: DesignTheme): string {
    const primaryColors = theme.tokens.colors.primary;
    const bgColor = this.getColorClass(primaryColors[5]?.value || '#3B82F6', 'bg');
    
    return `
<!-- CTA Section - Conversion Focused -->
<section id="cta" class="relative w-full ${bgColor} py-16 sm:py-24 overflow-hidden">
  <!-- Background Pattern -->
  <div class="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent pointer-events-none"></div>
  
  <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
    <div class="space-y-8">
      
      <h2 class="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
        Ready to Get Started?
      </h2>
      
      <p class="text-white opacity-90 text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
        Join thousands of satisfied customers and transform your digital presence today.
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-4">
        <button class="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105">
          Start Free Trial
        </button>
        <button class="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300">
          Schedule Demo
        </button>
      </div>
      
      <p class="text-white opacity-70 text-sm">
        No credit card required • Cancel anytime • Free 14-day trial
      </p>
      
    </div>
  </div>
</section>`;
  }
  
  private static generateFooterSection(theme: DesignTheme): string {
    const bgColor = theme.colorScheme === 'dark' ? 'bg-gray-900' : 'bg-gray-800';
    const textColor = 'text-white';
    
    return `
<!-- Footer - Professional Layout -->
<footer class="${bgColor} ${textColor} py-12 sm:py-16">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 mb-8">
      
      <!-- Column 1 - Brand -->
      <div class="space-y-4">
        <h3 class="text-xl font-bold">YourBrand</h3>
        <p class="opacity-70 text-sm leading-relaxed">
          Building exceptional digital experiences for modern businesses.
        </p>
      </div>
      
      <!-- Column 2 - Links -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold">Company</h4>
        <ul class="space-y-2">
          <li><a href="#about" class="opacity-70 hover:opacity-100 transition-opacity text-sm">About Us</a></li>
          <li><a href="#services" class="opacity-70 hover:opacity-100 transition-opacity text-sm">Services</a></li>
          <li><a href="#portfolio" class="opacity-70 hover:opacity-100 transition-opacity text-sm">Portfolio</a></li>
        </ul>
      </div>
      
      <!-- Column 3 - Resources -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold">Resources</h4>
        <ul class="space-y-2">
          <li><a href="#blog" class="opacity-70 hover:opacity-100 transition-opacity text-sm">Blog</a></li>
          <li><a href="#support" class="opacity-70 hover:opacity-100 transition-opacity text-sm">Support</a></li>
          <li><a href="#docs" class="opacity-70 hover:opacity-100 transition-opacity text-sm">Documentation</a></li>
        </ul>
      </div>
      
      <!-- Column 4 - Contact -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold">Contact</h4>
        <ul class="space-y-2">
          <li class="opacity-70 text-sm">contact@yourbrand.com</li>
          <li class="opacity-70 text-sm">+1 (555) 123-4567</li>
        </ul>
      </div>
      
    </div>
    
    <!-- Copyright -->
    <div class="border-t border-white/10 pt-8 text-center">
      <p class="opacity-60 text-sm">
        © ${new Date().getFullYear()} YourBrand. All rights reserved.
      </p>
    </div>
  </div>
</footer>`;
  }
  
  /**
   * Build complete HTML document
   */
  private static buildHTML(sections: string[], theme: DesignTheme, intent: UserIntent): string {
    const bgColor = theme.colorScheme === 'dark' ? 'bg-gray-900' : 'bg-white';
    
    return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${intent.domain.charAt(0).toUpperCase() + intent.domain.slice(1)} - Professional Website</title>
  <meta name="description" content="Professional ${intent.domain} website">
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Custom Styles for Smooth Animations -->
  <style>
    * {
      scroll-behavior: smooth;
    }
    
    /* Prevent layout shift and overlap */
    body {
      overflow-x: hidden;
    }
    
    /* Smooth transitions */
    a, button {
      transition: all 0.3s ease;
    }
    
    /* Custom animations */
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .fade-in-up {
      animation: fadeInUp 0.6s ease-out;
    }
  </style>
</head>
<body class="${bgColor} antialiased">
  
  ${sections.join('\n\n')}
  
</body>
</html>`;
  }
  
  /**
   * Generate VanillaJS interactions
   */
  private static generateJavaScript(sections: OrganismType[]): string {
    const hasNav = sections.includes('navigation');
    
    let js = `
// Elite AI Designer - VanillaJS Interactions
document.addEventListener('DOMContentLoaded', function() {
  console.log('Elite AI Designer - Website Loaded');
  
`;

    if (hasNav) {
      js += `
  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });
    
    // Close mobile menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
      });
    });
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
`;
    }
    
    js += `
  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe all sections
  document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
  });
  
});
`;
    
    return js;
  }
  
  /**
   * Helper: Convert hex color to Tailwind class
   */
  private static getColorClass(hex: string, prefix: 'bg' | 'text' | 'border'): string {
    // Map common colors to Tailwind classes
    const colorMap: Record<string, string> = {
      '#3B82F6': `${prefix}-blue-600`,
      '#10B981': `${prefix}-green-600`,
      '#8B5CF6': `${prefix}-purple-600`,
      '#EF4444': `${prefix}-red-600`,
      '#F59E0B': `${prefix}-yellow-600`,
      '#06B6D4': `${prefix}-cyan-600`,
      '#EC4899': `${prefix}-pink-600`,
      '#6366F1': `${prefix}-indigo-600`,
    };
    
    return colorMap[hex.toUpperCase()] || `${prefix}-blue-600`;
  }
}
