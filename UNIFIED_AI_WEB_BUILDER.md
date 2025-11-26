# Unified Intelligent AI Web Builder

## Overview

The Unified AI Web Builder combines design thinking methodology, simultaneous candidate evaluation, and multi-format generation into a single cohesive system that produces optimal website outputs.

## Architecture

### Core Service: `UnifiedAIWebBuilderService`

**Location**: `src/services/unifiedAIWebBuilder.ts`

Implements the complete design thinking workflow:

```typescript
UnifiedAIWebBuilderService.generateOptimalWebsite(prompt, strategy)
```

### Primary Hook: `useUnifiedAIWebBuilder`

**Location**: `src/hooks/useUnifiedAIWebBuilder.ts`

React hook for component integration:

```typescript
const {
  loading,
  progress,
  currentPhase,
  result,
  generateWebsite,
  generateQuick,
  generatePremium,
} = useUnifiedAIWebBuilder();
```

## Design Thinking Phases

### 1. EMPATHIZE 👂
**Goal**: Understand user needs and context

**Process**:
- Extract user requirements from prompt
- Identify industry, audience, goals
- Gather key messages and preferences

**Output**:
```typescript
{
  userNeeds: string[];
  context: {
    industry: string;
    audience: string;
    goals: string[];
  }
}
```

### 2. DEFINE 📋
**Goal**: Define the problem and requirements

**Process**:
- Parse user intent with `RequirementsAnalysisService`
- Validate requirements
- Create problem statement

**Output**:
```typescript
{
  userIntent: UserIntent;
  validation: ValidationResult;
  problemStatement: string;
}
```

**Example Problem Statement**:
> "Create a modern web template for technology that showcases innovative products."

### 3. IDEATE 💡
**Goal**: Generate multiple solution approaches

**Process**:
- Create diverse design approaches based on strategy
- Generate variations (bold, minimal, modern, etc.)
- Explore different aesthetic directions

**Diversity Levels**:
- **High**: 3+ distinct approaches (bold, minimal, gradient-heavy)
- **Medium**: 2 balanced approaches
- **Low**: 1 standard approach

**Output**:
```typescript
{
  solutions: string[];
  approaches: string[];
  candidateCount: number;
}
```

### 4. PROTOTYPE 🎨
**Goal**: Create actual template prototypes

**Process**:
- Generate multiple candidates (default: 3)
- Each with different mood/style variations
- Create both design system template and HTML code
- Convert to AIGeneratedTemplate format

**Variations**:
- Corporate (professional, blue-based)
- Playful (energetic, colorful)
- Minimal (elegant, whitespace)
- Bold (vibrant, asymmetric)
- Elegant (refined, sophisticated)

**Output**:
```typescript
{
  prototypes: Array<{
    designTemplate: DesignSystemTemplate;
    htmlCode: string;
    aiTemplate: AIGeneratedTemplate;
  }>;
}
```

### 5. TEST 🧪
**Goal**: Evaluate all candidates simultaneously

**Process**:
- Evaluate all prototypes in parallel
- Score across 6 dimensions:
  - Clarity (visual hierarchy, readability)
  - Consistency (design cohesion)
  - Responsiveness (mobile compatibility)
  - Accessibility (WCAG compliance)
  - Performance (load time, optimization)
  - Aesthetics (visual appeal)
- Select best candidate

**Evaluation Metrics**:
```typescript
{
  clarity: 0-100,
  consistency: 0-100,
  responsiveness: 0-100,
  accessibility: 0-100,
  performance: 0-100,
  aesthetics: 0-100,
  overall: weighted average
}
```

**Output**:
```typescript
{
  evaluations: GenerationCandidate[];
  bestCandidate: GenerationCandidate;
}
```

### 6. ITERATE 🔄
**Goal**: Refine the best candidate

**Process**:
- Analyze issues in best candidate
- Refine if score < 75 (quality threshold)
- Maximum 3 iterations
- Stop when improvement plateaus

**Improvement Areas**:
- Visual hierarchy (if clarity < 80)
- Design consistency (if consistency < 80)
- Accessibility features (if accessibility < 80)
- Visual aesthetics (if aesthetics < 80)

**Output**:
```typescript
{
  template: AIGeneratedTemplate;
  htmlCode: string;
  candidates: GenerationCandidate[];
  bestScore: number;
  designThinking: DesignThinkingInsights;
  iterations: number;
}
```

## Generation Strategies

### Quick Generation
```typescript
generateQuick(prompt)
```
- **Candidates**: 1
- **Diversity**: Low
- **Parallel**: No
- **Use Case**: Fast prototyping, testing

### Standard Generation
```typescript
generateWebsite(prompt)
```
- **Candidates**: 3 (default)
- **Diversity**: High
- **Parallel**: Yes
- **Use Case**: Production websites

### Premium Generation
```typescript
generatePremium(prompt)
```
- **Candidates**: 5
- **Diversity**: High
- **Parallel**: Yes
- **Use Case**: High-quality, critical projects

### Custom Strategy
```typescript
generateWebsite(prompt, {
  count: 4,
  diversity: 'medium',
  parallel: true,
  evaluateAll: true
})
```

## Usage Examples

### Basic Usage

```typescript
import { useUnifiedAIWebBuilder } from '@/hooks/useUnifiedAIWebBuilder';

function MyComponent() {
  const { generateWebsite, loading, result } = useUnifiedAIWebBuilder();

  const handleGenerate = async () => {
    const prompt = {
      industry: 'Technology',
      goal: 'Showcase innovative products',
      format: 'web',
      targetAudience: 'Tech-savvy professionals',
      preferredStyle: 'modern',
      brandKit: {
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        accentColor: '#ec4899',
        fonts: {
          heading: 'Inter',
          body: 'Inter',
          accent: 'Inter'
        }
      }
    };

    const result = await generateWebsite(prompt);
    if (result) {
      console.log('Generated template:', result.template);
      console.log('HTML code:', result.htmlCode);
      console.log('Best score:', result.bestScore);
    }
  };

  return (
    <button onClick={handleGenerate} disabled={loading}>
      {loading ? 'Generating...' : 'Generate Website'}
    </button>
  );
}
```

### With Progress Tracking

```typescript
function AdvancedComponent() {
  const {
    generateWebsite,
    loading,
    progress,
    currentPhase,
    result
  } = useUnifiedAIWebBuilder();

  return (
    <div>
      {loading && (
        <div>
          <progress value={progress} max={100} />
          <p>{currentPhase}</p>
        </div>
      )}
      {result && (
        <div>
          <h3>Score: {result.bestScore}/100</h3>
          <p>{result.designThinking.problemStatement}</p>
          <p>Iterations: {result.iterations}</p>
        </div>
      )}
    </div>
  );
}
```

### Multiple Candidates Review

```typescript
function CandidateReview() {
  const { result } = useUnifiedAIWebBuilder();

  return (
    <div>
      <h3>All Candidates ({result?.candidates.length})</h3>
      {result?.candidates.map((candidate, index) => (
        <div key={candidate.id}>
          <h4>Candidate {index + 1}</h4>
          <p>Score: {candidate.scores.overall}</p>
          <ul>
            <li>Clarity: {candidate.scores.clarity}</li>
            <li>Consistency: {candidate.scores.consistency}</li>
            <li>Accessibility: {candidate.scores.accessibility}</li>
            <li>Aesthetics: {candidate.scores.aesthetics}</li>
          </ul>
        </div>
      ))}
    </div>
  );
}
```

## Design Thinking Insights

The system provides insights into the design process:

```typescript
{
  userNeeds: [
    "Industry: Technology",
    "Goal: Showcase innovative products",
    "Format: web",
    "Target Audience: Tech-savvy professionals",
    "Style: modern"
  ],
  problemStatement: "Create a modern web template for technology that showcases innovative products.",
  solutions: [
    "Bold, vibrant color palette with asymmetric layouts",
    "Minimal, elegant design with generous whitespace",
    "Modern gradient-heavy aesthetic with micro-interactions"
  ],
  rationale: "Selected based on highest overall score (87/100)...",
  improvements: [
    "Addressed: Enhanced contrast ratios",
    "Addressed: Added ARIA labels",
    "Addressed: Improved mobile breakpoints"
  ]
}
```

## Quality Assurance

### Quality Threshold
- **Minimum Score**: 75/100
- **Optimal Score**: 85+/100
- **Excellent Score**: 90+/100

### Automatic Iteration
If best candidate scores < 75:
1. Analyze issues
2. Generate refined version
3. Re-evaluate
4. Repeat up to 3 times
5. Stop if no improvement

### Evaluation Dimensions

**Clarity (0-100)**:
- Visual hierarchy
- Typography readability
- Content organization
- Information architecture

**Consistency (0-100)**:
- Design system adherence
- Color usage
- Spacing rhythm
- Component styling

**Responsiveness (0-100)**:
- Mobile compatibility
- Breakpoint implementation
- Touch targets
- Viewport handling

**Accessibility (0-100)**:
- WCAG compliance
- Color contrast
- Keyboard navigation
- Screen reader support

**Performance (0-100)**:
- Code optimization
- Asset loading
- Bundle size
- Render speed

**Aesthetics (0-100)**:
- Visual appeal
- Brand alignment
- Modern design
- Professional polish

## AI Learning Integration

The system records successful patterns:

```typescript
{
  industry: 'Technology',
  format: 'web',
  style: 'modern',
  colorScheme: {...},
  typography: {...},
  effectiveness: 87
}
```

This enables:
- Continuous improvement
- Industry-specific optimizations
- Style preference learning
- Pattern recognition

## Migration from Legacy Hooks

### Old Way (useAITemplate)
```typescript
const { generateTemplate } = useAITemplate();
const template = await generateTemplate(prompt);
```

### New Way (useUnifiedAIWebBuilder)
```typescript
const { generateWebsite } = useUnifiedAIWebBuilder();
const result = await generateWebsite(prompt);
// Access: result.template, result.htmlCode, result.bestScore
```

### Benefits of Migration
✅ Design thinking methodology  
✅ Simultaneous candidate evaluation  
✅ Higher quality outputs  
✅ Progress tracking  
✅ Design insights  
✅ Automatic iteration  
✅ Learning integration  

## Performance Characteristics

### Quick Generation
- **Time**: ~3-5 seconds
- **Candidates**: 1
- **Quality**: Good (70-80)

### Standard Generation
- **Time**: ~8-12 seconds
- **Candidates**: 3
- **Quality**: Very Good (80-90)

### Premium Generation
- **Time**: ~15-20 seconds
- **Candidates**: 5
- **Quality**: Excellent (85-95)

## Best Practices

1. **Use Appropriate Strategy**: Quick for prototyping, Premium for production
2. **Provide Complete Prompts**: Include industry, goal, audience, style
3. **Review Candidates**: Check all candidates, not just the best
4. **Learn from Insights**: Use design thinking insights to improve prompts
5. **Monitor Scores**: Aim for 85+ for production websites
6. **Trust the Process**: The system iterates automatically

## Advanced Features

### Parallel Generation
All candidates generated simultaneously for speed.

### Automatic Refinement
Low-scoring candidates automatically refined.

### Multi-Format Support
- Web (responsive)
- Instagram Story (9:16)
- Instagram Post (1:1)
- Facebook Post
- Twitter
- Presentation
- Email

### Brand Kit Integration
Consistent colors and fonts across all sections.

### Data Binding Ready
Templates include `data-bind` attributes for dynamic content.

## Troubleshooting

**Low Scores (<70)**:
- Check prompt completeness
- Verify brand kit colors
- Review target audience
- Try premium generation

**Slow Generation**:
- Use quick mode for testing
- Reduce candidate count
- Disable parallel processing

**Inconsistent Results**:
- Increase diversity level
- Add more specific requirements
- Provide style references

## Future Enhancements

- [ ] A/B testing between candidates
- [ ] User preference learning
- [ ] Custom evaluation criteria
- [ ] Real-time preview updates
- [ ] Collaborative design thinking
- [ ] Export to Figma/Sketch

## Related Documentation

- [Template System](./TEMPLATE_SYSTEM.md)
- [Design System Architecture](./ARCHITECTURE.md)
- [AI Code Assistant](./supabase/functions/ai-code-assistant/)

---

**Last Updated**: November 26, 2025  
**Version**: 2.0.0  
**Status**: Production Ready
