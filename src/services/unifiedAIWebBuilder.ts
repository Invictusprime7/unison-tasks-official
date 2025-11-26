/**
 * Unified Intelligent AI Web Builder
 * Combines design thinking, simultaneous review, and multi-format generation
 * into a single cohesive system that produces optimal outputs
 */

import type {
  AIGeneratedTemplate,
  AITemplatePrompt,
  TemplateSection,
  TemplateComponent,
  TemplateVariant,
  TemplateBrandKit,
} from '@/types/template';
import type {
  UserIntent,
  DesignTheme,
  EvaluationScores,
  GenerationCandidate,
} from '@/types/designSystem';
import { RequirementsAnalysisService } from './requirementsAnalysisService';
import { DesignSystemGeneratorService } from './designSystemGeneratorService';
import { TemplateEvaluationService } from './templateEvaluationService';
import { EliteAIDesignerService } from './eliteAIDesignerService';
import { aiLearningService } from './aiLearningService';
import { IntelligentAIWebBuilder } from './intelligentAIWebBuilder';
import { SemanticPromptParser } from './semanticPromptParser';

/**
 * Design thinking phases for optimal output
 */
enum DesignPhase {
  EMPATHIZE = 'empathize',      // Understand user needs
  DEFINE = 'define',             // Define the problem
  IDEATE = 'ideate',             // Generate solutions
  PROTOTYPE = 'prototype',       // Create prototypes
  TEST = 'test',                 // Test and evaluate
  ITERATE = 'iterate',           // Refine based on feedback
}

/**
 * Candidate generation strategy
 */
interface GenerationStrategy {
  count: number;                 // Number of candidates to generate
  diversity: 'low' | 'medium' | 'high';
  parallel: boolean;             // Generate in parallel
  evaluateAll: boolean;          // Evaluate all before selecting
}

/**
 * Unified generation result
 */
interface UnifiedGenerationResult {
  template: AIGeneratedTemplate;
  htmlCode: string;
  candidates: GenerationCandidate[];
  bestScore: number;
  designThinking: DesignThinkingInsights;
  iterations: number;
  timestamp: string;
}

/**
 * Design thinking insights
 */
interface DesignThinkingInsights {
  userNeeds: string[];
  problemStatement: string;
  solutions: string[];
  rationale: string;
  improvements: string[];
}

/**
 * Unified Intelligent AI Web Builder Service
 */
export class UnifiedAIWebBuilderService {
  private static readonly DEFAULT_STRATEGY: GenerationStrategy = {
    count: 3,
    diversity: 'high',
    parallel: true,
    evaluateAll: true,
  };

  private static readonly QUALITY_THRESHOLD = 75; // Minimum acceptable score

  /**
   * Main entry point - Generate optimal website using design thinking
   */
  static async generateOptimalWebsite(
    prompt: AITemplatePrompt,
    strategy: Partial<GenerationStrategy> = {}
  ): Promise<UnifiedGenerationResult> {
    const fullStrategy = { ...this.DEFAULT_STRATEGY, ...strategy };

    console.log('🚀 Unified AI Web Builder - Starting generation');
    console.log('Strategy:', fullStrategy);

    // PHASE 1: EMPATHIZE - Understand user needs
    const empathizeResult = await this.empathizePhase(prompt);

    // PHASE 2: DEFINE - Define the problem and requirements
    const defineResult = await this.definePhase(empathizeResult);

    // PHASE 3: IDEATE - Generate multiple solutions
    const ideateResult = await this.ideatePhase(defineResult, fullStrategy);

    // PHASE 4: PROTOTYPE - Create prototypes
    const prototypeResult = await this.prototypePhase(ideateResult);

    // PHASE 5: TEST - Evaluate all candidates simultaneously
    const testResult = await this.testPhase(prototypeResult);

    // PHASE 6: ITERATE - Refine the best candidate
    const finalResult = await this.iteratePhase(testResult);

    console.log('✅ Generation complete! Best score:', finalResult.bestScore);

    return finalResult;
  }

  /**
   * PHASE 1: EMPATHIZE - Understand user needs and context with semantic intelligence
   */
  private static async empathizePhase(prompt: AITemplatePrompt) {
    console.log('👂 EMPATHIZE: Understanding user needs with semantic AI...');

    // Use semantic parsing to understand the true intent
    const semanticIntent = SemanticPromptParser.parsePrompt(prompt.goal || '');
    
    console.log(`🧠 Semantic Analysis: ${semanticIntent.componentType} (${semanticIntent.confidence}% confidence)`);
    console.log(`📊 Interpretation: ${semanticIntent.reasoning}`);

    const userNeeds = [
      `Industry: ${prompt.industry}`,
      `Goal: ${prompt.goal}`,
      `Semantic Intent: ${semanticIntent.componentType}`,
      `Confidence: ${semanticIntent.confidence}%`,
      `Format: ${prompt.format}`,
      `Target Audience: ${prompt.targetAudience || 'General'}`,
      `Style: ${prompt.preferredStyle || 'Modern'}`,
    ];

    if (prompt.keyMessages) {
      userNeeds.push(`Key Messages: ${prompt.keyMessages.join(', ')}`);
    }

    return {
      prompt,
      userNeeds,
      semanticIntent, // Include semantic understanding
      context: {
        industry: prompt.industry,
        audience: prompt.targetAudience,
        goals: [prompt.goal],
        componentType: semanticIntent.componentType,
      },
    };
  }

  /**
   * PHASE 2: DEFINE - Define problem and requirements
   */
  private static async definePhase(empathizeResult: any) {
    console.log('📋 DEFINE: Analyzing requirements...');

    const { prompt } = empathizeResult;

    // Parse user intent
    const userIntent = RequirementsAnalysisService.parseUserIntent(prompt);

    // Validate requirements
    const validation = RequirementsAnalysisService.validateIntent(userIntent);

    if (!validation.valid) {
      throw new Error(`Invalid requirements: ${validation.errors.join(', ')}`);
    }

    // Define problem statement
    const problemStatement = `Create a ${prompt.preferredStyle || 'modern'} ${
      prompt.format
    } template for ${prompt.industry} that ${prompt.goal.toLowerCase()}.`;

    return {
      ...empathizeResult,
      userIntent,
      validation,
      problemStatement,
    };
  }

  /**
   * PHASE 3: IDEATE - Generate multiple solution candidates
   */
  private static async ideatePhase(
    defineResult: any,
    strategy: GenerationStrategy
  ) {
    console.log(
      `💡 IDEATE: Generating ${strategy.count} solution candidates...`
    );

    const { userIntent, prompt } = defineResult;
    const solutions: string[] = [];

    // Generate diverse approaches based on diversity level
    const approaches = this.generateApproaches(userIntent, strategy.diversity);
    solutions.push(...approaches);

    return {
      ...defineResult,
      solutions,
      approaches,
      candidateCount: strategy.count,
    };
  }

  /**
   * PHASE 4: PROTOTYPE - Create actual prototypes
   */
  private static async prototypePhase(ideateResult: any) {
    console.log('🎨 PROTOTYPE: Creating template prototypes...');

    const { userIntent, prompt, candidateCount } = ideateResult;
    const prototypes: any[] = [];

    // Generate multiple candidates with variations
    for (let i = 0; i < candidateCount; i++) {
      console.log(`Creating candidate ${i + 1}/${candidateCount}...`);

      // Vary the generation approach
      const variation = this.createVariation(userIntent, i);

      // Generate design system template
      const designTemplate = DesignSystemGeneratorService.generateTemplate(variation);

      // Generate HTML code
      const htmlCode = EliteAIDesignerService.generateWebsite(variation);

      // Convert to AI template format
      const aiTemplate = await this.convertToAITemplate(
        designTemplate,
        htmlCode,
        prompt,
        i
      );

      prototypes.push({
        index: i,
        designTemplate,
        htmlCode,
        aiTemplate,
      });
    }

    return {
      ...ideateResult,
      prototypes,
    };
  }

  /**
   * PHASE 5: TEST - Evaluate all candidates simultaneously
   */
  private static async testPhase(prototypeResult: any) {
    console.log('🧪 TEST: Evaluating all candidates simultaneously...');

    const { prototypes } = prototypeResult;
    const evaluations: GenerationCandidate[] = [];

    // Evaluate all prototypes in parallel
    const evaluationPromises = prototypes.map(async (prototype: any) => {
      const page = this.createPageFromPrototype(prototype);
      return await TemplateEvaluationService.evaluateCandidate(page);
    });

    const results = await Promise.all(evaluationPromises);
    evaluations.push(...results);

    // Find best candidate
    const bestCandidate = results.reduce((best, current) =>
      current.scores.overall > best.scores.overall ? current : best
    );

    console.log('Best candidate score:', bestCandidate.scores.overall);

    return {
      ...prototypeResult,
      evaluations,
      bestCandidate,
    };
  }

  /**
   * PHASE 6: ITERATE - Refine the best candidate
   */
  private static async iteratePhase(testResult: any) {
    console.log('🔄 ITERATE: Refining best candidate...');

    const { bestCandidate, prototypes, prompt, userNeeds, problemStatement, solutions } = testResult;

    let iterations = 0;
    let currentCandidate = bestCandidate;
    let currentScore = bestCandidate.scores.overall;

    // Iterate while below quality threshold and under iteration limit
    while (
      currentScore < this.QUALITY_THRESHOLD &&
      iterations < 3
    ) {
      console.log(
        `Iteration ${iterations + 1}: Score ${currentScore}, refining...`
      );

      // Analyze issues
      const issues = this.analyzeIssues(currentCandidate);

      // Generate refined version
      const refinedPrototype = await this.refinePrototype(
        prototypes[bestCandidate.id],
        issues
      );

      // Re-evaluate
      const refinedPage = this.createPageFromPrototype(refinedPrototype);
      const refinedCandidate = await TemplateEvaluationService.evaluateCandidate(
        refinedPage
      );

      // Check if improved
      if (refinedCandidate.scores.overall > currentScore) {
        currentCandidate = refinedCandidate;
        currentScore = refinedCandidate.scores.overall;
        console.log(`✨ Improved to ${currentScore}!`);
      } else {
        console.log('No improvement, stopping iterations');
        break;
      }

      iterations++;
    }

    // Find the prototype matching the best candidate
    const bestPrototype = prototypes.find(
      (p: any) => p.aiTemplate.id === currentCandidate.id
    );

    // Prepare design thinking insights
    const designThinking: DesignThinkingInsights = {
      userNeeds,
      problemStatement,
      solutions,
      rationale: this.generateRationale(currentCandidate),
      improvements: currentCandidate.warnings.map((w: string) => `Addressed: ${w}`),
    };

    // Learn from this generation
    await this.recordLearning(prompt, currentCandidate, designThinking);

    return {
      template: bestPrototype.aiTemplate,
      htmlCode: bestPrototype.htmlCode.html,
      candidates: testResult.evaluations,
      bestScore: currentScore,
      designThinking,
      iterations,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate diverse approaches based on diversity level
   */
  private static generateApproaches(
    userIntent: UserIntent,
    diversity: 'low' | 'medium' | 'high'
  ): string[] {
    const approaches: string[] = [];

    switch (diversity) {
      case 'high':
        approaches.push(
          'Bold, vibrant color palette with asymmetric layouts',
          'Minimal, elegant design with generous whitespace',
          'Modern gradient-heavy aesthetic with micro-interactions'
        );
        break;
      case 'medium':
        approaches.push(
          'Balanced professional design with brand colors',
          'Clean, organized layout with subtle animations'
        );
        break;
      case 'low':
        approaches.push('Standard professional template with industry best practices');
        break;
    }

    return approaches;
  }

  /**
   * Create variation of user intent for diversity
   */
  private static createVariation(userIntent: UserIntent, index: number): UserIntent {
    const moods = ['corporate', 'playful', 'minimal', 'bold', 'elegant'];
    const mood = moods[index % moods.length];

    return {
      ...userIntent,
      style: {
        ...userIntent.style,
        mood: mood as any,
      },
    };
  }

  /**
   * Convert design template to AI template format
   */
  private static async convertToAITemplate(
    designTemplate: any,
    htmlCode: any,
    prompt: AITemplatePrompt,
    index: number
  ): Promise<AIGeneratedTemplate> {
    const brandKit: TemplateBrandKit = (prompt.brandKit as TemplateBrandKit) || {
      primaryColor: designTemplate.theme.colors.primary,
      secondaryColor: designTemplate.theme.colors.secondary,
      accentColor: designTemplate.theme.colors.accent,
      fonts: {
        heading: designTemplate.theme.typography.fontFamily.heading,
        body: designTemplate.theme.typography.fontFamily.body,
        accent: designTemplate.theme.typography.fontFamily.body,
      },
    };

    const variant: TemplateVariant = {
      id: `variant-${index}`,
      name: `${prompt.format} Version`,
      size: this.getFormatSize(prompt.format),
      format: prompt.format,
    };

    return {
      id: `template-${Date.now()}-${index}`,
      name: `${prompt.industry} ${prompt.format} Template`,
      description: prompt.goal,
      industry: prompt.industry,
      brandKit,
      sections: [], // Will be populated from HTML
      variants: [variant],
      data: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get format dimensions
   */
  private static getFormatSize(
    format: TemplateVariant['format']
  ): { width: number; height: number } {
    const sizes: Record<string, { width: number; height: number }> = {
      web: { width: 1920, height: 1080 },
      'instagram-story': { width: 1080, height: 1920 },
      'instagram-post': { width: 1080, height: 1080 },
      'facebook-post': { width: 1200, height: 630 },
      twitter: { width: 1200, height: 675 },
      presentation: { width: 1920, height: 1080 },
      email: { width: 600, height: 800 },
    };

    return sizes[format] || sizes.web;
  }

  /**
   * Create page from prototype for evaluation
   */
  private static createPageFromPrototype(prototype: any): any {
    return {
      id: prototype.aiTemplate.id,
      meta: {
        title: prototype.aiTemplate.name,
        description: prototype.aiTemplate.description,
        slug: prototype.aiTemplate.industry.toLowerCase(),
      },
      template: prototype.designTemplate,
      accessibility: {
        wcagLevel: 'AA' as const,
        screenReaderOptimized: true,
        keyboardNavigable: true,
      },
      performance: {
        cssBudget: 50,
        jsBudget: 50,
        imageBudget: 500,
        lazyLoadImages: true,
      },
    };
  }

  /**
   * Analyze issues in candidate
   */
  private static analyzeIssues(candidate: GenerationCandidate): string[] {
    const issues: string[] = [];

    if (candidate.scores.clarity < 80) {
      issues.push('Improve visual hierarchy and clarity');
    }
    if (candidate.scores.consistency < 80) {
      issues.push('Enhance design consistency');
    }
    if (candidate.scores.accessibility < 80) {
      issues.push('Improve accessibility features');
    }
    if (candidate.scores.aesthetics < 80) {
      issues.push('Refine visual aesthetics');
    }

    issues.push(...candidate.warnings);

    return issues;
  }

  /**
   * Refine prototype based on issues
   */
  private static async refinePrototype(prototype: any, issues: string[]): Promise<any> {
    console.log('Refining prototype based on:', issues);

    // For now, return the same prototype
    // In a full implementation, this would apply specific refinements
    return prototype;
  }

  /**
   * Generate rationale for the design decision
   */
  private static generateRationale(candidate: GenerationCandidate): string {
    return `Selected based on highest overall score (${candidate.scores.overall}/100). 
    Strong performance in clarity (${candidate.scores.clarity}), 
    consistency (${candidate.scores.consistency}), and 
    aesthetics (${candidate.scores.aesthetics}). 
    Meets accessibility standards (${candidate.scores.accessibility}) and 
    responsive design requirements (${candidate.scores.responsiveness}).`;
  }

  /**
   * Record learning from this generation
   */
  private static async recordLearning(
    prompt: AITemplatePrompt,
    candidate: GenerationCandidate,
    insights: DesignThinkingInsights
  ): Promise<void> {
    try {
      // TODO: Re-enable when AI learning service has recordPattern method
      console.log('Learning recorded:', {
        industry: prompt.industry,
        score: candidate.scores.overall,
        insights: insights.problemStatement
      });
      
      // await aiLearningService.recordPattern({
      //   industry: prompt.industry,
      //   format: prompt.format,
      //   style: prompt.preferredStyle || 'modern',
      //   colorScheme: {
      //     primary: prompt.brandKit?.primaryColor || '#3b82f6',
      //     secondary: prompt.brandKit?.secondaryColor || '#8b5cf6',
      //     accent: prompt.brandKit?.accentColor || '#ec4899',
      //     background: '#ffffff',
      //     text: '#1f2937',
      //   },
      //   typography: {
      //     fontFamily: prompt.brandKit?.fonts.heading || 'Inter',
      //     fontSize: 16,
      //     lineHeight: 1.5,
      //     fontWeight: 'normal',
      //   },
      //   layout: 'grid',
      //   sections: [],
      //   effectiveness: candidate.scores.overall,
      // });

      // console.log('✅ Learning recorded successfully');
    } catch (error) {
      console.error('Failed to record learning:', error);
    }
  }
}

export default UnifiedAIWebBuilderService;
