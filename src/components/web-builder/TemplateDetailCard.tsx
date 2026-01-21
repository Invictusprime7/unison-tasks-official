/**
 * TemplateDetailCard
 * Rich template preview with system info, features, and demo button
 */

import React from 'react';
import { 
  Play, 
  Check, 
  Zap, 
  ArrowRight,
  Star,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { LayoutTemplate, BusinessSystemType } from '@/data/templates/types';
import { getSystemContract } from '@/data/templates/contracts';
import { businessSystems } from '@/data/templates/types';

interface TemplateDetailCardProps {
  template: LayoutTemplate;
  onSelect: (template: LayoutTemplate) => void;
  onDemo?: (template: LayoutTemplate) => void;
  isSelected?: boolean;
  showDemoButton?: boolean;
}

export const TemplateDetailCard: React.FC<TemplateDetailCardProps> = ({
  template,
  onSelect,
  onDemo,
  isSelected,
  showDemoButton = true,
}) => {
  // Find the system this template belongs to
  const system = businessSystems.find(s => 
    s.templateCategories.includes(template.category)
  );
  const contract = system ? getSystemContract(system.id) : undefined;

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200",
        "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
        isSelected && "border-primary bg-primary/5"
      )}
      onClick={() => onSelect(template)}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {system && (
                <span className="text-lg" role="img" aria-label={system.name}>
                  {system.icon}
                </span>
              )}
              <h3 className="font-medium text-sm truncate">{template.name}</h3>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          </div>
          
          {isSelected && (
            <div className="shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </div>

        {/* System Badge */}
        {system && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className={cn("text-xs", system.color.replace('bg-', 'bg-') + '/20')}>
              {system.name}
            </Badge>
            {template.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Features Preview */}
        {contract && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="w-3 h-3" />
              <span>Pre-wired intents:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {contract.requiredIntents.slice(0, 3).map((intent) => (
                <Badge 
                  key={intent} 
                  variant="secondary" 
                  className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary"
                >
                  {intent.split('.')[1]}
                </Badge>
              ))}
              {contract.requiredIntents.length > 3 && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  +{contract.requiredIntents.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* What you get */}
        {system && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-1.5">What you get:</p>
            <ul className="space-y-1">
              {system.features.slice(0, 3).map((feature) => (
                <li key={feature} className="flex items-center gap-1.5 text-xs">
                  <Check className="w-3 h-3 text-primary shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button 
            size="sm" 
            className="flex-1 h-8"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(template);
            }}
          >
            Use Template
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
          
          {showDemoButton && onDemo && (
            <Button 
              size="sm" 
              variant="outline"
              className="h-8"
              onClick={(e) => {
                e.stopPropagation();
                onDemo(template);
              }}
            >
              <Play className="w-3 h-3 mr-1" />
              Demo
            </Button>
          )}
        </div>

        {/* Quick stats */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-primary fill-primary" />
            <span>Popular</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Ready in 5 min</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateDetailCard;
