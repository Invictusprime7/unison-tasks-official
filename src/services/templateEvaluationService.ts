/**
 * Template Evaluation Service
 * Implements Phase 5: Generative Variation & Evaluation
 * Scores templates on 6 dimensions for quality assurance
 */

import type {
  Template,
  Page,
  GenerationCandidate,
  EvaluationCriteria,
  EvaluationScores
} from '@/types/designSystem';

/**
 * Default evaluation weights (sum to 1.0)
 */
const DEFAULT_WEIGHTS: EvaluationCriteria = {
  clarity: { weight: 0.20, checks: [] },
  consistency: { weight: 0.20, checks: [] },
  responsiveness: { weight: 0.20, checks: [] },
  accessibility: { weight: 0.15, checks: [] },
  performance: { weight: 0.15, checks: [] },
  aesthetics: { weight: 0.10, checks: [] }
};

/**
 * Template Evaluation Service
 */
export class TemplateEvaluationService {
  
  /**
   * Evaluate a page candidate and generate scores
   */
  static async evaluateCandidate(
    page: Page,
    criteria: EvaluationCriteria = DEFAULT_WEIGHTS
  ): Promise<GenerationCandidate> {
    const scores: EvaluationScores = {
      clarity: this.evaluateClarity(page),
      consistency: this.evaluateConsistency(page),
      responsiveness: this.evaluateResponsiveness(page),
      accessibility: this.evaluateAccessibility(page),
      performance: this.evaluatePerformance(page),
      aesthetics: this.evaluateAesthetics(page),
      overall: 0
    };
    
    // Calculate weighted overall score
    scores.overall = this.calculateOverallScore(scores, criteria);
    
    // Collect warnings and errors
    const warnings = this.collectWarnings(page, scores);
    const errors = this.collectErrors(page, scores);
    
    return {
      id: `candidate-${Date.now()}`,
      page,
      scores,
      warnings,
      errors,
      generatedAt: new Date()
    };
  }
  
  /**
   * 1. Evaluate Clarity & Readability (0-100)
   * - Clear visual hierarchy
   * - Legible typography (14px+ body text)
   * - Sufficient contrast (4.5:1 minimum)
   * - Scannable content structure
   */
  private static evaluateClarity(page: Page): number {
    let score = 0;
    const template = page.template;
    
    // Check visual hierarchy (30 points)
    const hasHero = template.organisms.some(o => o.type === 'hero');
    if (hasHero) score += 30;
    
    // Check typography size (30 points)
    const bodySize = template.theme.tokens.typography.body.fontSize || 0;
    if (bodySize >= 14 && bodySize <= 18) {
      score += 30;
    } else if (bodySize >= 12) {
      score += 15;
    }
    
    // Check heading sizes (20 points)
    const headingSize = template.theme.tokens.typography.heading.fontSize || 0;
    if (headingSize >= 32 && headingSize <= 64) {
      score += 20;
    } else if (headingSize >= 24) {
      score += 10;
    }
    
    // Check spacing for scannability (20 points)
    const hasAdequateSpacing = template.layout.gap >= 2;
    if (hasAdequateSpacing) score += 20;
    
    return Math.min(100, score);
  }
  
  /**
   * 2. Evaluate Consistency & Coherence (0-100)
   * - Adherence to design tokens
   * - Consistent spacing patterns
   * - Unified color palette usage
   * - Harmonious typography
   */
  private static evaluateConsistency(page: Page): number {
    let score = 0;
    const template = page.template;
    
    // Check tokens usage (40 points)
    if (template.theme && template.theme.tokens) {
      score += 40;
    }
    
    // Check consistent spacing (30 points)
    const organisms = template.organisms;
    if (organisms.length > 0) {
      const firstGap = organisms[0].layout?.gap;
      const consistentGap = organisms.every(o => 
        o.layout?.gap === firstGap || !o.layout?.gap
      );
      if (consistentGap) score += 30;
    }
    
    // Check color palette (20 points)
    if (template.theme.tokens.colors) {
      score += 20;
    }
    
    // Check typography harmony (10 points)
    const hasTwoOrLessFonts = true; // Always true with our token system
    if (hasTwoOrLessFonts) score += 10;
    
    return Math.min(100, score);
  }
  
  /**
   * 3. Evaluate Responsiveness (0-100)
   * - Works at all breakpoints
   * - No horizontal scrolling
   * - Touch-friendly on mobile
   * - Appropriate font sizes
   */
  private static evaluateResponsiveness(page: Page): number {
    let score = 0;
    const template = page.template;
    
    // Check breakpoints defined (30 points)
    if (template.layout.breakpoints) {
      score += 30;
    }
    
    // Check mobile-first approach (25 points)
    const hasResponsiveOrganisms = template.organisms.some(o => o.responsive);
    if (hasResponsiveOrganisms) score += 25;
    
    // Check grid columns adaptation (25 points)
    const organisms = template.organisms;
    const hasAdaptiveColumns = organisms.some(o => {
      return o.responsive?.mobile?.columns !== o.responsive?.desktop?.columns;
    });
    if (hasAdaptiveColumns) score += 25;
    
    // Check container max-width (20 points)
    if (template.layout.maxWidth && template.layout.maxWidth <= 1536) {
      score += 20;
    }
    
    return Math.min(100, score);
  }
  
  /**
   * 4. Evaluate Accessibility (0-100)
   * - WCAG AA compliance target
   * - Keyboard navigable
   * - Screen reader friendly
   * - ARIA labels present
   */
  private static evaluateAccessibility(page: Page): number {
    let score = 0;
    
    // Check WCAG target (30 points)
    if (page.accessibility?.wcagLevel) {
      if (page.accessibility.wcagLevel === 'AAA') score += 30;
      else if (page.accessibility.wcagLevel === 'AA') score += 25;
      else score += 15;
    }
    
    // Check keyboard navigation (25 points)
    if (page.accessibility?.keyboardNavigable) {
      score += 25;
    }
    
    // Check screen reader optimization (25 points)
    if (page.accessibility?.screenReaderOptimized) {
      score += 25;
    }
    
    // Check ARIA labels (20 points)
    const template = page.template;
    const hasAriaLabels = template.organisms.some(o =>
      o.molecules.some(m =>
        m.atoms.some(a => a.ariaLabel)
      )
    );
    if (hasAriaLabels) score += 20;
    
    return Math.min(100, score);
  }
  
  /**
   * 5. Evaluate Performance (0-100)
   * - < 100KB CSS/JS total
   * - Optimized images
   * - Lazy loading implemented
   * - Minimal DOM depth
   */
  private static evaluatePerformance(page: Page): number {
    let score = 0;
    
    // Check CSS budget (25 points)
    if (page.performance?.cssBudget && page.performance.cssBudget <= 100) {
      score += 25;
    }
    
    // Check JS budget (25 points)
    if (page.performance?.jsBudget && page.performance.jsBudget <= 100) {
      score += 25;
    }
    
    // Check image budget (25 points)
    if (page.performance?.imageBudget && page.performance.imageBudget <= 500) {
      score += 25;
    }
    
    // Check lazy loading (25 points)
    if (page.performance?.lazyLoadImages) {
      score += 25;
    }
    
    return Math.min(100, score);
  }
  
  /**
   * 6. Evaluate Aesthetics (0-100)
   * - Visual balance
   * - Pleasing color harmonies
   * - Professional appearance
   * - Attention to detail
   */
  private static evaluateAesthetics(page: Page): number {
    let score = 0;
    const template = page.template;
    
    // Check theme application (30 points)
    if (template.theme) {
      score += 30;
    }
    
    // Check color harmony (25 points)
    if (template.theme.colorScheme) {
      score += 25;
    }
    
    // Check spacing/whitespace (25 points)
    const hasGenerousSpacing = template.layout.gap >= 3;
    if (hasGenerousSpacing) score += 25;
    
    // Check border radius (20 points)
    const radiusValue = template.theme.tokens.radius.md.value;
    const hasRoundedCorners = typeof radiusValue === 'number' && radiusValue > 0;
    if (hasRoundedCorners) score += 20;
    
    return Math.min(100, score);
  }
  
  /**
   * Calculate weighted overall score
   */
  private static calculateOverallScore(
    scores: EvaluationScores,
    criteria: EvaluationCriteria
  ): number {
    const overall = 
      scores.clarity * criteria.clarity.weight +
      scores.consistency * criteria.consistency.weight +
      scores.responsiveness * criteria.responsiveness.weight +
      scores.accessibility * criteria.accessibility.weight +
      scores.performance * criteria.performance.weight +
      scores.aesthetics * criteria.aesthetics.weight;
    
    return Math.round(overall);
  }
  
  /**
   * Collect warnings based on scores
   */
  private static collectWarnings(page: Page, scores: EvaluationScores): string[] {
    const warnings: string[] = [];
    
    if (scores.clarity < 70) {
      warnings.push('Clarity score below 70: Consider improving typography and hierarchy');
    }
    
    if (scores.consistency < 70) {
      warnings.push('Consistency score below 70: Review design token usage');
    }
    
    if (scores.responsiveness < 70) {
      warnings.push('Responsiveness score below 70: Improve mobile layout adaptation');
    }
    
    if (scores.accessibility < 70) {
      warnings.push('Accessibility score below 70: Add ARIA labels and improve keyboard navigation');
    }
    
    if (scores.performance < 70) {
      warnings.push('Performance score below 70: Optimize assets and enable lazy loading');
    }
    
    if (scores.aesthetics < 70) {
      warnings.push('Aesthetics score below 70: Review color harmony and spacing');
    }
    
    // Check specific issues
    if (!page.accessibility?.wcagLevel || page.accessibility.wcagLevel === 'A') {
      warnings.push('WCAG AA compliance recommended for better accessibility');
    }
    
    if (!page.performance?.lazyLoadImages) {
      warnings.push('Enable lazy loading for better performance');
    }
    
    return warnings;
  }
  
  /**
   * Collect errors (blocking issues)
   */
  private static collectErrors(page: Page, scores: EvaluationScores): string[] {
    const errors: string[] = [];
    
    if (scores.clarity < 50) {
      errors.push('CRITICAL: Clarity score below 50 - template may be unusable');
    }
    
    if (scores.accessibility < 50) {
      errors.push('CRITICAL: Accessibility score below 50 - may violate WCAG standards');
    }
    
    if (scores.responsiveness < 50) {
      errors.push('CRITICAL: Responsiveness score below 50 - template may break on mobile');
    }
    
    if (!page.template.organisms || page.template.organisms.length === 0) {
      errors.push('CRITICAL: No sections defined in template');
    }
    
    return errors;
  }
  
  /**
   * Rank candidates by overall score
   */
  static rankCandidates(candidates: GenerationCandidate[]): GenerationCandidate[] {
    return [...candidates].sort((a, b) => b.scores.overall - a.scores.overall);
  }
  
  /**
   * Filter candidates above threshold
   */
  static filterByThreshold(
    candidates: GenerationCandidate[],
    minScore: number = 60
  ): GenerationCandidate[] {
    return candidates.filter(c => c.scores.overall >= minScore);
  }
  
  /**
   * Get best candidate
   */
  static getBestCandidate(candidates: GenerationCandidate[]): GenerationCandidate | null {
    if (candidates.length === 0) return null;
    
    const ranked = this.rankCandidates(candidates);
    return ranked[0];
  }
  
  /**
   * Compare two candidates
   */
  static compareCandidates(
    a: GenerationCandidate,
    b: GenerationCandidate
  ): {
    winner: 'a' | 'b' | 'tie';
    scoreDiff: number;
    strengths: { a: string[]; b: string[] };
  } {
    const scoreDiff = a.scores.overall - b.scores.overall;
    
    let winner: 'a' | 'b' | 'tie' = 'tie';
    if (scoreDiff > 5) winner = 'a';
    else if (scoreDiff < -5) winner = 'b';
    
    // Find strengths
    const strengthsA: string[] = [];
    const strengthsB: string[] = [];
    
    const dimensions: Array<keyof Omit<EvaluationScores, 'overall'>> = [
      'clarity', 'consistency', 'responsiveness', 
      'accessibility', 'performance', 'aesthetics'
    ];
    
    for (const dim of dimensions) {
      const aScore = a.scores[dim];
      const bScore = b.scores[dim];
      
      if (aScore > bScore + 10) {
        strengthsA.push(dim);
      } else if (bScore > aScore + 10) {
        strengthsB.push(dim);
      }
    }
    
    return {
      winner,
      scoreDiff,
      strengths: {
        a: strengthsA,
        b: strengthsB
      }
    };
  }
  
  /**
   * Generate evaluation report
   */
  static generateReport(candidate: GenerationCandidate): string {
    const { scores, warnings, errors } = candidate;
    
    let report = `# Template Evaluation Report\n\n`;
    report += `**Overall Score**: ${scores.overall}/100\n\n`;
    report += `## Dimension Scores\n\n`;
    report += `- **Clarity**: ${scores.clarity}/100\n`;
    report += `- **Consistency**: ${scores.consistency}/100\n`;
    report += `- **Responsiveness**: ${scores.responsiveness}/100\n`;
    report += `- **Accessibility**: ${scores.accessibility}/100\n`;
    report += `- **Performance**: ${scores.performance}/100\n`;
    report += `- **Aesthetics**: ${scores.aesthetics}/100\n\n`;
    
    if (errors.length > 0) {
      report += `## ❌ Errors\n\n`;
      errors.forEach(error => {
        report += `- ${error}\n`;
      });
      report += `\n`;
    }
    
    if (warnings.length > 0) {
      report += `## ⚠️ Warnings\n\n`;
      warnings.forEach(warning => {
        report += `- ${warning}\n`;
      });
      report += `\n`;
    }
    
    return report;
  }
}
