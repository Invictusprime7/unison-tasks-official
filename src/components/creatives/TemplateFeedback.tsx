import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Star, ThumbsUp, ThumbsDown, Heart, Zap, Eye, Code } from 'lucide-react';
import { aiLearningService } from '@/services/aiLearningService';
import { useToast } from '@/hooks/use-toast';

interface TemplateFeedbackProps {
  generationId: string;
  userId: string;
  templateCode: string;
  onFeedbackSubmitted: () => void;
  onClose: () => void;
}

const FEEDBACK_TYPES = [
  { value: 'design', label: 'Design Quality', icon: Eye, color: 'bg-purple-100 text-purple-700' },
  { value: 'code_quality', label: 'Code Quality', icon: Code, color: 'bg-blue-100 text-blue-700' },
  { value: 'usability', label: 'Usability', icon: ThumbsUp, color: 'bg-green-100 text-green-700' },
  { value: 'creativity', label: 'Creativity', icon: Zap, color: 'bg-yellow-100 text-yellow-700' }
];

const HELPFUL_ELEMENTS = [
  'Color scheme',
  'Layout structure', 
  'Typography choices',
  'Component design',
  'Responsive behavior',
  'Code organization',
  'Interactive elements',
  'Visual hierarchy',
  'Spacing and alignment',
  'Overall creativity'
];

const IMPROVEMENT_SUGGESTIONS = [
  'Better color contrast',
  'More modern fonts',
  'Improved mobile layout',
  'Better component structure',
  'More interactive elements',
  'Cleaner code organization',
  'Better accessibility',
  'More creative design',
  'Improved spacing',
  'Better visual hierarchy'
];

export const TemplateFeedback: React.FC<TemplateFeedbackProps> = ({
  generationId,
  userId,
  templateCode,
  onFeedbackSubmitted,
  onClose
}) => {
  const [rating, setRating] = useState<number>(0);
  const [feedbackType, setFeedbackType] = useState<string>('design');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [helpfulElements, setHelpfulElements] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<number>(1);

  const { toast } = useToast();

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    if (step === 1) {
      setTimeout(() => setStep(2), 500);
    }
  };

  const toggleHelpfulElement = (element: string) => {
    setHelpfulElements(prev => 
      prev.includes(element) 
        ? prev.filter(e => e !== element)
        : [...prev, element]
    );
  };

  const toggleImprovement = (improvement: string) => {
    setImprovements(prev => 
      prev.includes(improvement)
        ? prev.filter(i => i !== improvement)
        : [...prev, improvement]
    );
  };

  const submitFeedback = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please provide a rating before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await aiLearningService.submitFeedback({
        generation_id: generationId,
        rating,
        feedback_type: feedbackType as 'design' | 'code_quality' | 'usability' | 'creativity',
        feedback_text: feedbackText.trim() || undefined,
        helpful_elements: helpfulElements.length > 0 ? helpfulElements : undefined,
        improvement_suggestions: improvements.length > 0 ? improvements : undefined,
        would_use_again: rating >= 4
      }, userId);

      toast({
        title: "Feedback Submitted! 🎉",
        description: "Thank you for helping improve AI template generation.",
      });

      onFeedbackSubmitted();
      onClose();

    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Heart className="h-5 w-5 text-red-500" />
              <h3 className="text-xl font-semibold">Rate This Template</h3>
            </div>
            <p className="text-sm text-gray-600">
              Your feedback helps the AI learn and create better templates
            </p>
          </div>

          {/* Step 1: Rating */}
          {step >= 1 && (
            <div className="mb-6">
              <div className="text-center">
                <h4 className="font-medium mb-4">How would you rate this template?</h4>
                <div className="flex justify-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Button
                      key={star}
                      variant={rating >= star ? "default" : "outline"}
                      size="lg"
                      onClick={() => handleRatingChange(star)}
                      className={`p-2 ${rating >= star ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                    >
                      <Star className={`h-6 w-6 ${rating >= star ? 'fill-current text-white' : 'text-yellow-500'}`} />
                    </Button>
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  {rating === 0 && "Click to rate"}
                  {rating === 1 && "Poor - Major issues"}
                  {rating === 2 && "Fair - Some improvements needed"}
                  {rating === 3 && "Good - Satisfactory quality"}
                  {rating === 4 && "Great - High quality template"}
                  {rating === 5 && "Excellent - Outstanding template"}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Feedback Type */}
          {step >= 2 && (
            <div className="mb-6">
              <h4 className="font-medium mb-4">What aspect would you like to focus on?</h4>
              <div className="grid grid-cols-2 gap-3">
                {FEEDBACK_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.value}
                      variant={feedbackType === type.value ? "default" : "outline"}
                      onClick={() => setFeedbackType(type.value)}
                      className="h-auto p-3 justify-start"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {type.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Detailed Feedback */}
          {step >= 2 && rating > 0 && (
            <div className="space-y-6">
              {/* What was helpful */}
              {rating >= 3 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                    What worked well?
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {HELPFUL_ELEMENTS.map((element) => (
                      <Badge
                        key={element}
                        variant={helpfulElements.includes(element) ? "default" : "outline"}
                        className="cursor-pointer justify-center py-2 hover:bg-green-100"
                        onClick={() => toggleHelpfulElement(element)}
                      >
                        {element}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* What could be improved */}
              {rating <= 4 && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4 text-orange-600" />
                    What could be improved?
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {IMPROVEMENT_SUGGESTIONS.map((improvement) => (
                      <Badge
                        key={improvement}
                        variant={improvements.includes(improvement) ? "default" : "outline"}
                        className="cursor-pointer justify-center py-2 hover:bg-orange-100"
                        onClick={() => toggleImprovement(improvement)}
                      >
                        {improvement}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Comments */}
              <div>
                <h4 className="font-medium mb-3">Additional Comments (Optional)</h4>
                <Textarea
                  placeholder="Share any specific thoughts, suggestions, or comments about this template..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Skip Feedback
            </Button>
            <Button
              onClick={submitFeedback}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>

          {/* AI Learning Info */}
          <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-purple-800">AI Learning Active</span>
            </div>
            <p className="text-xs text-purple-700">
              Your feedback is being used to improve future template generation. 
              The AI learns from patterns in highly-rated templates and user preferences.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TemplateFeedback;