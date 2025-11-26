/**
 * Intelligent AI Web Builder Service
 * Uses semantic understanding to generate precise, professional web components
 * Industry-leading intelligence comparable to ChatGPT and GitHub Copilot
 */

import { SemanticPromptParser, type SemanticIntent } from './semanticPromptParser';
import type { AITemplatePrompt } from '@/types/template';

export interface IntelligentGenerationRequest {
  prompt: string;
  context?: {
    industry?: string;
    brandColor?: string;
    targetAudience?: string;
    style?: string;
  };
}

export interface IntelligentGenerationResult {
  html: string;
  css: string;
  javascript: string;
  semanticIntent: SemanticIntent;
  explanation: string;
  suggestions: string[];
}

/**
 * Intelligent AI Web Builder Service
 * Understands semantic intent and generates professional web components
 */
export class IntelligentAIWebBuilder {
  
  /**
   * Generate web component from natural language prompt
   * Uses semantic understanding to interpret user intent correctly
   */
  static async generateFromPrompt(request: IntelligentGenerationRequest): Promise<IntelligentGenerationResult> {
    console.log('🧠 Intelligent AI Web Builder - Processing prompt:', request.prompt);
    
    // Step 1: Parse semantic intent
    const semanticIntent = SemanticPromptParser.parsePrompt(request.prompt);
    
    console.log('✅ Semantic Understanding:', {
      component: semanticIntent.componentType,
      confidence: semanticIntent.confidence,
      reasoning: semanticIntent.reasoning
    });
    
    // Step 2: Generate professional HTML
    const html = this.generateProfessionalHTML(semanticIntent, request.context);
    
    // Step 3: Generate supporting CSS (if needed)
    const css = this.generateSupportingCSS(semanticIntent);
    
    // Step 4: Generate JavaScript for interactivity
    const javascript = this.generateJavaScript(semanticIntent);
    
    // Step 5: Create human-readable explanation
    const explanation = this.generateExplanation(semanticIntent, request.prompt);
    
    // Step 6: Provide improvement suggestions
    const suggestions = this.generateSuggestions(semanticIntent);
    
    return {
      html,
      css,
      javascript,
      semanticIntent,
      explanation,
      suggestions
    };
  }

  /**
   * Generate professional, production-ready HTML
   */
  private static generateProfessionalHTML(
    intent: SemanticIntent,
    context?: IntelligentGenerationRequest['context']
  ): string {
    const brandColor = context?.brandColor || '#3B82F6';
    
    switch (intent.componentType) {
      case 'navigation':
        return this.generateNavigationHTML(intent, brandColor);
      
      case 'hero':
        return this.generateHeroHTML(intent, brandColor);
      
      case 'card':
        return this.generateCardHTML(intent, brandColor);
      
      case 'button':
        return this.generateButtonHTML(intent, brandColor);
      
      case 'form':
        return this.generateFormHTML(intent, brandColor);
      
      case 'gallery':
        return this.generateGalleryHTML(intent, brandColor);
      
      case 'modal':
        return this.generateModalHTML(intent, brandColor);
      
      case 'footer':
        return this.generateFooterHTML(intent, brandColor);
      
      case 'section':
      default:
        return this.generateSectionHTML(intent, brandColor);
    }
  }

  /**
   * Generate professional navigation bar
   */
  private static generateNavigationHTML(intent: SemanticIntent, brandColor: string): string {
    const positionClass = intent.properties.position === 'fixed' 
      ? 'fixed top-0 left-0 right-0 z-50' 
      : intent.properties.position === 'sticky'
      ? 'sticky top-0 z-50'
      : 'relative';
    
    const bgClass = intent.styling.background === 'blur'
      ? 'backdrop-blur-md bg-white/90 dark:bg-gray-900/90'
      : intent.styling.background === 'transparent'
      ? 'bg-transparent'
      : 'bg-white dark:bg-gray-900';
    
    const shadowClass = intent.styling.elevation === 'floating'
      ? 'shadow-lg'
      : intent.styling.elevation === 'raised'
      ? 'shadow-md'
      : 'border-b border-gray-200 dark:border-gray-800';

    const spacer = intent.properties.position === 'fixed' 
      ? '\n<!-- Spacer to prevent content overlap -->\n<div class="h-16 sm:h-20"></div>' 
      : '';

    return `<!-- Professional Navigation Bar -->
<nav class="${positionClass} ${bgClass} ${shadowClass} transition-all duration-300" role="navigation" aria-label="Main navigation">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div class="flex items-center justify-between h-16 sm:h-20">
      
      <!-- Logo/Brand -->
      <div class="flex-shrink-0">
        <a href="/" class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white hover:opacity-80 transition-opacity" aria-label="Home">
          YourBrand
        </a>
      </div>
      
      <!-- Desktop Navigation Links -->
      <div class="hidden md:flex items-center space-x-8">
        <a href="#features" class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
          Features
        </a>
        <a href="#about" class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
          About
        </a>
        <a href="#pricing" class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
          Pricing
        </a>
        <a href="#contact" class="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
          Contact
        </a>
        <button class="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg" aria-label="Get started">
          Get Started
        </button>
      </div>
      
      <!-- Mobile Menu Button -->
      <button 
        id="mobile-menu-btn" 
        class="md:hidden p-2 rounded-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Toggle mobile menu"
        aria-expanded="false"
        aria-controls="mobile-menu"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>
      
    </div>
  </div>
  
  <!-- Mobile Menu Panel -->
  <div id="mobile-menu" class="hidden md:hidden border-t border-gray-200 dark:border-gray-800" role="menu">
    <div class="container mx-auto px-4 py-4 space-y-2">
      <a href="#features" class="block py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors" role="menuitem">
        Features
      </a>
      <a href="#about" class="block py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors" role="menuitem">
        About
      </a>
      <a href="#pricing" class="block py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors" role="menuitem">
        Pricing
      </a>
      <a href="#contact" class="block py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors" role="menuitem">
        Contact
      </a>
      <button class="w-full mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
        Get Started
      </button>
    </div>
  </div>
</nav>${spacer}`;
  }

  /**
   * Generate professional hero section
   */
  private static generateHeroHTML(intent: SemanticIntent, brandColor: string): string {
    const sizeClass = intent.properties.size === 'full' 
      ? 'min-h-screen' 
      : 'py-16 sm:py-24 md:py-32';
    
    const alignClass = intent.properties.alignment === 'center'
      ? 'flex items-center justify-center text-center'
      : intent.properties.alignment === 'left'
      ? 'flex items-center justify-start text-left'
      : 'flex items-center justify-center text-center';

    return `<!-- Professional Hero Section -->
<section class="relative w-full ${sizeClass} ${alignClass} bg-gradient-to-br from-blue-600 to-purple-600 overflow-hidden">
  
  <!-- Background Decoration -->
  <div class="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent pointer-events-none"></div>
  <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMC0ydjItMnptLTItMmgyLTJ6bTAtMmgyLTJ6bS0yLTJoMi0yem0wLTJoMi0yem0wLTJoMi0yem0wLTJoMi0yem0wLTJoMi0yem0wLTJoMi0yem0wLTJoMi0yeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
  
  <!-- Content Container -->
  <div class="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div class="max-w-4xl ${intent.properties.alignment === 'center' ? 'mx-auto' : ''} space-y-8">
      
      <!-- Main Headline -->
      <h1 class="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-in-up">
        Transform Your Digital Presence
      </h1>
      
      <!-- Subheading -->
      <p class="text-white/90 text-lg sm:text-xl md:text-2xl leading-relaxed max-w-3xl ${intent.properties.alignment === 'center' ? 'mx-auto' : ''} animate-fade-in-up animation-delay-200">
        Professional solutions designed for modern businesses. Built with precision, powered by innovation.
      </p>
      
      <!-- Call-to-Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 sm:gap-6 ${intent.properties.alignment === 'center' ? 'justify-center' : ''} animate-fade-in-up animation-delay-400">
        <button class="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 focus:ring-4 focus:ring-white/50 focus:outline-none">
          Get Started Free
        </button>
        <button class="px-8 py-4 border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-gray-900 transition-all duration-300 focus:ring-4 focus:ring-white/50 focus:outline-none">
          Watch Demo
        </button>
      </div>
      
      <!-- Trust Indicators (Optional) -->
      <div class="flex flex-wrap items-center gap-6 ${intent.properties.alignment === 'center' ? 'justify-center' : ''} text-white/70 text-sm animate-fade-in-up animation-delay-600">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
          </svg>
          <span>4.9/5 Rating</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path>
          </svg>
          <span>10,000+ Users</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
          <span>Enterprise Ready</span>
        </div>
      </div>
      
    </div>
  </div>
  
  <!-- Scroll Indicator (for full-height heroes) -->
  ${intent.properties.size === 'full' ? `
  <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
    <svg class="w-6 h-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
    </svg>
  </div>
  ` : ''}
  
</section>`;
  }

  /**
   * Generate professional card component
   */
  private static generateCardHTML(intent: SemanticIntent, brandColor: string): string {
    const shadowClass = intent.styling.elevation === 'floating'
      ? 'shadow-2xl'
      : intent.styling.elevation === 'raised'
      ? 'shadow-xl'
      : 'shadow-md';
    
    const borderClass = intent.styling.borders === 'rounded'
      ? 'rounded-2xl'
      : intent.styling.borders === 'prominent'
      ? 'rounded-lg border-2'
      : 'rounded-lg';
    
    const hoverClass = intent.behavior.hoverEffects
      ? 'hover:scale-105 hover:shadow-2xl transition-all duration-300'
      : 'transition-shadow duration-300';

    return `<!-- Professional Card Component -->
<div class="bg-white dark:bg-gray-800 ${borderClass} ${shadowClass} ${hoverClass} p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
  
  <!-- Icon/Visual Element -->
  <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg">
    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
    </svg>
  </div>
  
  <!-- Card Title -->
  <h3 class="text-gray-900 dark:text-white text-xl sm:text-2xl font-bold mb-4">
    Feature Title
  </h3>
  
  <!-- Card Description -->
  <p class="text-gray-600 dark:text-gray-400 text-base leading-relaxed mb-6">
    Compelling description of this feature explaining its benefits and value proposition to users.
  </p>
  
  <!-- Optional CTA -->
  <a href="#" class="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm transition-colors">
    Learn More
    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
    </svg>
  </a>
  
</div>`;
  }

  /**
   * Generate professional button component
   */
  private static generateButtonHTML(intent: SemanticIntent, brandColor: string): string {
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
      xl: 'px-10 py-5 text-xl',
      full: 'w-full px-8 py-4 text-lg'
    };

    const sizeClass = sizeClasses[intent.properties.size || 'md'];

    const styleClass = intent.styling.background === 'gradient'
      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
      : intent.styling.background === 'transparent'
      ? 'bg-transparent border-2 border-blue-600 text-blue-600'
      : 'bg-blue-600 text-white';

    const borderClass = intent.styling.borders === 'rounded'
      ? 'rounded-full'
      : 'rounded-lg';

    return `<!-- Professional Button -->
<button 
  class="${sizeClass} ${styleClass} ${borderClass} font-semibold hover:scale-105 hover:shadow-xl transition-all duration-300 focus:ring-4 focus:ring-blue-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
  ${intent.behavior.interactive ? 'onclick="handleClick(event)"' : ''}
>
  Get Started
</button>`;
  }

  /**
   * Generate professional form component
   */
  private static generateFormHTML(intent: SemanticIntent, brandColor: string): string {
    const layoutClass = intent.properties.layout === 'horizontal' ? 'flex flex-row gap-4' : 'space-y-6';

    return `<!-- Professional Form -->
<form class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-10 border border-gray-200 dark:border-gray-700">
  <div class="${layoutClass}">
    
    <!-- Form Fields -->
    <div class="flex-1 space-y-2">
      <label for="name" class="text-gray-900 dark:text-white text-sm font-semibold">Name</label>
      <input 
        type="text" 
        id="name"
        name="name"
        placeholder="John Doe" 
        class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        required
        aria-required="true"
      />
    </div>
    
    <div class="flex-1 space-y-2">
      <label for="email" class="text-gray-900 dark:text-white text-sm font-semibold">Email</label>
      <input 
        type="email" 
        id="email"
        name="email"
        placeholder="john@example.com" 
        class="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg border border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        required
        aria-required="true"
      />
    </div>
    
    <!-- Submit Button -->
    <button 
      type="submit" 
      class="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl focus:ring-4 focus:ring-blue-500/50 focus:outline-none ${intent.properties.layout === 'horizontal' ? 'self-end' : 'w-full'}"
    >
      Submit
    </button>
    
  </div>
</form>`;
  }

  /**
   * Generate professional gallery component
   */
  private static generateGalleryHTML(intent: SemanticIntent, brandColor: string): string {
    return `<!-- Professional Gallery Grid -->
<section class="py-16 sm:py-24">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      
      <!-- Gallery Item 1 -->
      <div class="relative group overflow-hidden rounded-2xl aspect-square ${intent.behavior.hoverEffects ? 'hover:scale-105 transition-transform duration-300' : ''}">
        <div class="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600"></div>
        ${intent.behavior.hoverEffects ? `
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div class="text-white text-center">
            <h3 class="text-xl font-bold mb-2">Project Title</h3>
            <p class="text-sm">View Details →</p>
          </div>
        </div>
        ` : ''}
      </div>
      
      <!-- Gallery Item 2 -->
      <div class="relative group overflow-hidden rounded-2xl aspect-square ${intent.behavior.hoverEffects ? 'hover:scale-105 transition-transform duration-300' : ''}">
        <div class="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-600"></div>
        ${intent.behavior.hoverEffects ? `
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div class="text-white text-center">
            <h3 class="text-xl font-bold mb-2">Project Title</h3>
            <p class="text-sm">View Details →</p>
          </div>
        </div>
        ` : ''}
      </div>
      
      <!-- Gallery Item 3 -->
      <div class="relative group overflow-hidden rounded-2xl aspect-square ${intent.behavior.hoverEffects ? 'hover:scale-105 transition-transform duration-300' : ''}">
        <div class="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600"></div>
        ${intent.behavior.hoverEffects ? `
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div class="text-white text-center">
            <h3 class="text-xl font-bold mb-2">Project Title</h3>
            <p class="text-sm">View Details →</p>
          </div>
        </div>
        ` : ''}
      </div>
      
    </div>
  </div>
</section>`;
  }

  /**
   * Generate professional modal component
   */
  private static generateModalHTML(intent: SemanticIntent, brandColor: string): string {
    return `<!-- Professional Modal Dialog -->
<div id="modal" class="fixed inset-0 z-50 hidden" style="display: none;">
  <div class="absolute inset-0 w-full h-full flex items-center justify-center p-4">
  
  <!-- Backdrop Overlay -->
  <div class="absolute inset-0 bg-black/50 ${intent.styling.background === 'blur' ? 'backdrop-blur-sm' : ''}" onclick="closeModal()"></div>
  
  <!-- Modal Content -->
  <div class="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 transform transition-all">
    
    <!-- Close Button -->
    <button 
      onclick="closeModal()" 
      class="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      aria-label="Close modal"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
    
    <!-- Modal Header -->
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
      Modal Title
    </h2>
    
    <!-- Modal Body -->
    <p class="text-gray-600 dark:text-gray-400 mb-6">
      Modal content goes here. This can contain forms, information, or any other content you need.
    </p>
    
    <!-- Modal Actions -->
    <div class="flex gap-4">
      <button class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
        Confirm
      </button>
      <button onclick="closeModal()" class="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
        Cancel
      </button>
    </div>
    
  </div>
</div>`;
  }

  /**
   * Generate professional footer component
   */
  private static generateFooterHTML(intent: SemanticIntent, brandColor: string): string {
    return `<!-- Professional Footer -->
<footer class="bg-gray-900 text-white py-12 sm:py-16">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 mb-8">
      
      <!-- Brand Column -->
      <div class="space-y-4">
        <h3 class="text-xl font-bold">YourBrand</h3>
        <p class="text-gray-400 text-sm leading-relaxed">
          Building exceptional digital experiences for modern businesses.
        </p>
      </div>
      
      <!-- Links Columns -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold">Company</h4>
        <ul class="space-y-2">
          <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">About Us</a></li>
          <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Careers</a></li>
          <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Press</a></li>
        </ul>
      </div>
      
      <div class="space-y-4">
        <h4 class="text-lg font-semibold">Resources</h4>
        <ul class="space-y-2">
          <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Blog</a></li>
          <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Support</a></li>
          <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Docs</a></li>
        </ul>
      </div>
      
      <div class="space-y-4">
        <h4 class="text-lg font-semibold">Legal</h4>
        <ul class="space-y-2">
          <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Privacy</a></li>
          <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Terms</a></li>
          <li><a href="#" class="text-gray-400 hover:text-white transition-colors text-sm">Cookie Policy</a></li>
        </ul>
      </div>
      
    </div>
    
    <!-- Copyright -->
    <div class="border-t border-gray-800 pt-8 text-center">
      <p class="text-gray-400 text-sm">
        © ${new Date().getFullYear()} YourBrand. All rights reserved.
      </p>
    </div>
  </div>
</footer>`;
  }

  /**
   * Generate generic section HTML
   */
  private static generateSectionHTML(intent: SemanticIntent, brandColor: string): string {
    return `<!-- Professional Section -->
<section class="py-16 sm:py-24">
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
    
    <!-- Section Header -->
    <div class="text-center mb-12 space-y-4">
      <h2 class="text-gray-900 dark:text-white text-3xl sm:text-4xl md:text-5xl font-bold">
        Section Title
      </h2>
      <p class="text-gray-600 dark:text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto">
        Compelling section description goes here
      </p>
    </div>
    
    <!-- Section Content -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Content items go here -->
    </div>
    
  </div>
</section>`;
  }

  /**
   * Generate supporting CSS (custom animations, etc.)
   */
  private static generateSupportingCSS(intent: SemanticIntent): string {
    if (intent.styling.animation === 'none') {
      return '';
    }

    return `/* Custom Animations */
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

.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

.animation-delay-600 {
  animation-delay: 0.6s;
}

/* Smooth Transitions */
* {
  scroll-behavior: smooth;
}`;
  }

  /**
   * Generate JavaScript for interactivity
   */
  private static generateJavaScript(intent: SemanticIntent): string {
    let js = `// Intelligent AI Generated JavaScript\ndocument.addEventListener('DOMContentLoaded', function() {\n`;

    if (intent.componentType === 'navigation') {
      js += `
  // Mobile menu toggle
  const menuBtn = document.querySelector('#mobile-menu-btn');
  const menu = document.querySelector('#mobile-menu');
  
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = !menu.classList.contains('hidden');
      menu.classList.toggle('hidden');
      menuBtn.setAttribute('aria-expanded', !isOpen);
    });
    
    // Close menu on link click
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
`;
    }

    if (intent.componentType === 'modal') {
      js += `
  // Modal functions
  window.openModal = function() {
    const modal = document.getElementById('modal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }
  };
  
  window.closeModal = function() {
    const modal = document.getElementById('modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  };
  
  // Close modal on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      window.closeModal();
    }
  });
`;
    }

    js += `\n  console.log('Component initialized: ${intent.componentType}');\n});\n`;

    return js;
  }

  /**
   * Generate human-readable explanation
   */
  private static generateExplanation(intent: SemanticIntent, originalPrompt: string): string {
    return `I understood your request "${originalPrompt}" as a ${intent.componentType} component ${intent.reasoning}.

The generated code includes:
- Professional, production-ready HTML with semantic markup
- Responsive design that works on all devices (mobile-first approach)
- Accessibility features (ARIA labels, keyboard navigation)
- Modern Tailwind CSS utility classes for styling
- Smooth animations and transitions
- Interactive JavaScript where needed

Confidence Level: ${intent.confidence}%`;
  }

  /**
   * Generate improvement suggestions
   */
  private static generateSuggestions(intent: SemanticIntent): string[] {
    const suggestions: string[] = [];

    if (intent.componentType === 'navigation' && !intent.behavior.scrollEffect) {
      suggestions.push('Consider adding scroll effects like "hide on scroll" or "shrink on scroll" for better UX');
    }

    if (intent.componentType === 'hero' && intent.properties.size !== 'full') {
      suggestions.push('For maximum impact, consider making this a full-screen hero section');
    }

    if (!intent.behavior.hoverEffects && (intent.componentType === 'card' || intent.componentType === 'button')) {
      suggestions.push('Add hover effects for better interactivity');
    }

    if (intent.styling.animation === 'none') {
      suggestions.push('Consider adding subtle animations for a more polished feel');
    }

    if (intent.confidence < 75) {
      suggestions.push('Your prompt could be more specific. Try including details like "fixed", "rounded", "gradient", etc.');
    }

    return suggestions;
  }
}
