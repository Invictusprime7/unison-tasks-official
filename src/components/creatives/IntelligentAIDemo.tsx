/**
 * Intelligent AI Web Builder Demo
 * Test the semantic understanding capabilities
 */

import React, { useState } from 'react';
import { IntelligentAIWebBuilder } from '@/services/intelligentAIWebBuilder';
import type { IntelligentGenerationResult } from '@/services/intelligentAIWebBuilder';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Code, Lightbulb, CheckCircle2, AlertTriangle } from 'lucide-react';

const EXAMPLE_PROMPTS = [
  "floating navigation bar",
  "fullscreen hero section with centered content",
  "elevated card with hover effect",
  "transparent sticky navbar with blur",
  "large rounded gradient button",
  "responsive contact form",
  "masonry photo gallery with lightbox",
  "dark footer with social links"
];

export const IntelligentAIDemo: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IntelligentGenerationResult | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    try {
      const generated = await IntelligentAIWebBuilder.generateFromPrompt({
        prompt: prompt.trim(),
        context: {
          brandColor: '#3B82F6',
          industry: 'Technology',
          style: 'modern'
        }
      });

      setResult(generated);
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const setExamplePrompt = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-blue-600 bg-blue-100';
    if (confidence >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-7 h-7 text-purple-600" />
            Intelligent AI Web Builder
          </CardTitle>
          <CardDescription className="text-base">
            Industry-leading semantic intelligence. Just describe what you want in natural language.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Input Section */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              What do you want to create?
            </label>
            <Input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Try: "floating navigation bar" or "fullscreen hero section"'
              className="text-base h-12"
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>

          {/* Example Prompts */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">
              Quick Examples:
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_PROMPTS.map((example) => (
                <Button
                  key={example}
                  variant="outline"
                  size="sm"
                  onClick={() => setExamplePrompt(example)}
                  className="text-sm"
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || loading}
            className="w-full h-12 text-lg"
          >
            {loading ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                Analyzing with Semantic AI...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Component
              </>
            )}
          </Button>

        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Semantic Understanding */}
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                Semantic Understanding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Component Type & Confidence */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Detected Component</p>
                  <p className="text-xl font-bold text-purple-900 capitalize">
                    {result.semanticIntent.componentType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Confidence</p>
                  <Badge className={`text-lg px-4 py-1 ${getConfidenceColor(result.semanticIntent.confidence)}`}>
                    {result.semanticIntent.confidence}%
                  </Badge>
                </div>
              </div>

              {/* Reasoning */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Interpretation:</p>
                <p className="text-base text-gray-800 bg-white rounded-lg p-3 border border-purple-200">
                  {result.semanticIntent.reasoning}
                </p>
              </div>

              {/* Properties */}
              <div className="grid grid-cols-2 gap-4">
                {result.semanticIntent.properties.position && (
                  <div>
                    <p className="text-sm text-gray-600">Position</p>
                    <p className="font-semibold capitalize">{result.semanticIntent.properties.position}</p>
                  </div>
                )}
                {result.semanticIntent.styling.elevation && (
                  <div>
                    <p className="text-sm text-gray-600">Elevation</p>
                    <p className="font-semibold capitalize">{result.semanticIntent.styling.elevation}</p>
                  </div>
                )}
                {result.semanticIntent.styling.background && (
                  <div>
                    <p className="text-sm text-gray-600">Background</p>
                    <p className="font-semibold capitalize">{result.semanticIntent.styling.background}</p>
                  </div>
                )}
                {result.semanticIntent.properties.layout && (
                  <div>
                    <p className="text-sm text-gray-600">Layout</p>
                    <p className="font-semibold capitalize">{result.semanticIntent.properties.layout}</p>
                  </div>
                )}
              </div>

            </CardContent>
          </Card>

          {/* Explanation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                AI Explanation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                {result.explanation}
              </p>
            </CardContent>
          </Card>

          {/* Generated Code */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Code className="w-5 h-5 text-blue-600" />
                Generated Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* HTML */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">HTML:</p>
                <Textarea
                  value={result.html}
                  readOnly
                  className="font-mono text-sm h-64 bg-gray-50"
                />
              </div>

              {/* JavaScript */}
              {result.javascript && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">JavaScript:</p>
                  <Textarea
                    value={result.javascript}
                    readOnly
                    className="font-mono text-sm h-32 bg-gray-50"
                  />
                </div>
              )}

              {/* CSS */}
              {result.css && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">CSS:</p>
                  <Textarea
                    value={result.css}
                    readOnly
                    className="font-mono text-sm h-32 bg-gray-50"
                  />
                </div>
              )}

            </CardContent>
          </Card>

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  Improvement Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-yellow-600 font-bold">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

        </>
      )}

    </div>
  );
};

export default IntelligentAIDemo;
