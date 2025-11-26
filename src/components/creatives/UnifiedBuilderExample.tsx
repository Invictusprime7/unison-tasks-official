/**
 * Example: Unified AI Web Builder Component
 * Demonstrates design thinking workflow with progress tracking
 */

import React, { useState } from 'react';
import { useUnifiedAIWebBuilder } from '@/hooks/useUnifiedAIWebBuilder';
import type { AITemplatePrompt } from '@/types/template';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const UnifiedBuilderExample: React.FC = () => {
  const {
    loading,
    progress,
    currentPhase,
    result,
    generateWebsite,
    generateQuick,
    generatePremium,
    reset,
  } = useUnifiedAIWebBuilder();

  const [selectedStrategy, setSelectedStrategy] = useState<'quick' | 'standard' | 'premium'>('standard');

  const handleGenerate = async () => {
    const prompt: AITemplatePrompt = {
      industry: 'Technology',
      goal: 'Showcase innovative AI products and services',
      format: 'web',
      targetAudience: 'Tech-savvy professionals and decision makers',
      preferredStyle: 'modern',
      keyMessages: [
        'Cutting-edge AI solutions',
        'Trusted by industry leaders',
        'Transform your business with AI',
      ],
      brandKit: {
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        accentColor: '#ec4899',
        fonts: {
          heading: 'Inter',
          body: 'Inter',
          accent: 'Inter',
        },
      },
    };

    switch (selectedStrategy) {
      case 'quick':
        await generateQuick(prompt);
        break;
      case 'premium':
        await generatePremium(prompt);
        break;
      default:
        await generateWebsite(prompt);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return 'Excellent';
    if (score >= 75) return 'Very Good';
    if (score >= 60) return 'Good';
    return 'Needs Improvement';
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Unified AI Web Builder
          </CardTitle>
          <CardDescription>
            Design thinking workflow with simultaneous candidate evaluation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Strategy Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Generation Strategy</label>
            <div className="flex gap-2">
              <Button
                variant={selectedStrategy === 'quick' ? 'default' : 'outline'}
                onClick={() => setSelectedStrategy('quick')}
                disabled={loading}
              >
                Quick (1 candidate)
              </Button>
              <Button
                variant={selectedStrategy === 'standard' ? 'default' : 'outline'}
                onClick={() => setSelectedStrategy('standard')}
                disabled={loading}
              >
                Standard (3 candidates)
              </Button>
              <Button
                variant={selectedStrategy === 'premium' ? 'default' : 'outline'}
                onClick={() => setSelectedStrategy('premium')}
                disabled={loading}
              >
                Premium (5 candidates)
              </Button>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Website
              </>
            )}
          </Button>

          {/* Progress */}
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{currentPhase}</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-4 pt-4 border-t">
              {/* Overall Score */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Generation Complete!</h3>
                  <p className="text-sm text-muted-foreground">
                    {result.iterations} iteration{result.iterations !== 1 ? 's' : ''} performed
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${getScoreColor(result.bestScore)}`}>
                    {result.bestScore}
                  </div>
                  <Badge variant={result.bestScore >= 85 ? 'default' : 'secondary'}>
                    {getScoreBadge(result.bestScore)}
                  </Badge>
                </div>
              </div>

              {/* Design Thinking Insights */}
              {result.designThinking && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Design Thinking Insights</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Problem Statement</h4>
                      <p className="text-sm text-muted-foreground">
                        {result.designThinking.problemStatement}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Solutions Explored</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {result.designThinking.solutions.map((solution, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">Rationale</h4>
                      <p className="text-sm text-muted-foreground">
                        {result.designThinking.rationale}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Candidates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    All Candidates ({result.candidates.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.candidates
                      .sort((a, b) => b.scores.overall - a.scores.overall)
                      .map((candidate, index) => (
                        <div
                          key={candidate.id}
                          className={`p-3 rounded-lg border ${
                            index === 0 ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-sm">
                              Candidate {index + 1}
                              {index === 0 && (
                                <Badge variant="default" className="ml-2">
                                  Selected
                                </Badge>
                              )}
                            </span>
                            <span className={`text-lg font-bold ${getScoreColor(candidate.scores.overall)}`}>
                              {candidate.scores.overall}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Clarity:</span>{' '}
                              <span className="font-medium">{candidate.scores.clarity}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Consistency:</span>{' '}
                              <span className="font-medium">{candidate.scores.consistency}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Aesthetics:</span>{' '}
                              <span className="font-medium">{candidate.scores.aesthetics}</span>
                            </div>
                          </div>
                          {candidate.warnings.length > 0 && (
                            <div className="mt-2 flex items-start gap-1 text-xs text-yellow-600">
                              <AlertCircle className="w-3 h-3 mt-0.5" />
                              <span>{candidate.warnings[0]}</span>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={reset} className="flex-1">
                  Reset
                </Button>
                <Button onClick={handleGenerate} className="flex-1">
                  Generate Again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnifiedBuilderExample;
