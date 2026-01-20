import React, { useState } from 'react';
import { Layout, Search, Folder, ChevronRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  layoutTemplates,
  getTemplatesByCategory,
  searchTemplates,
  getAllCategories,
  type LayoutCategory,
  type LayoutTemplate,
} from '@/data/layoutTemplates';
import { intentTestTemplate } from '@/data/templates/test/intentTestTemplate';

interface LayoutTemplatesPanelProps {
  onSelectTemplate: (code: string, name: string) => void;
}

const categoryLabels: Record<LayoutCategory, string> = {
  landing: 'Landing Pages',
  portfolio: 'Portfolio',
  restaurant: 'Restaurant',
  ecommerce: 'E-Commerce',
  blog: 'Blog',
  contractor: 'Contractor',
  agency: 'Agency',
  startup: 'Startup',
};

const categoryIcons: Record<LayoutCategory, string> = {
  landing: '🚀',
  portfolio: '🎨',
  restaurant: '🍽️',
  ecommerce: '🛍️',
  blog: '📝',
  contractor: '🔨',
  agency: '💼',
  startup: '💡',
};

export const LayoutTemplatesPanel: React.FC<LayoutTemplatesPanelProps> = ({
  onSelectTemplate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LayoutCategory | null>(null);

  const categories = getAllCategories();
  const filteredTemplates = searchQuery
    ? searchTemplates(searchQuery)
    : selectedCategory
    ? getTemplatesByCategory(selectedCategory)
    : layoutTemplates;

  const handleTemplateClick = (template: LayoutTemplate) => {
    onSelectTemplate(template.code, template.name);
    toast.success(`Loaded: ${template.name}`);
  };

  return (
    <div className="h-full flex flex-col bg-[#0f0d15]">
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Layout className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Layout Templates</h3>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-white/40" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-xs bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
        </div>
      </div>

      {/* Categories */}
      {!searchQuery && (
        <div className="p-3 border-b border-white/10">
          <ScrollArea className="w-full">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="h-7 text-xs"
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="h-7 text-xs"
                >
                  <span className="mr-1">{categoryIcons[category]}</span>
                  {categoryLabels[category]}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Templates List */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {/* Test Template - Always at top */}
          <Card
            className="group cursor-pointer hover:border-emerald-500/50 transition-all bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
            onClick={() => {
              onSelectTemplate(intentTestTemplate, 'Intent Listener Test');
              toast.success('Loaded: Intent Listener Test - Click buttons to test auto-wiring!');
            }}
          >
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="h-4 w-4 text-emerald-400" />
                    <h4 className="text-sm font-medium truncate text-white">🎯 Intent Listener Test</h4>
                    <Badge className="text-[10px] px-1.5 py-0 bg-emerald-500/30 text-emerald-300 border-emerald-500/50">
                      TEST
                    </Badge>
                  </div>
                  <p className="text-xs text-white/60 line-clamp-2">
                    Test template with buttons for all intent types. Verify auto-wiring works!
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
              </div>
            </CardContent>
          </Card>
          
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-white/40 text-sm">
              <Layout className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No templates found</p>
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <Card
                key={template.id}
                className="group cursor-pointer hover:border-blue-500/50 transition-all bg-white/5 border-white/10 hover:bg-white/10"
                onClick={() => handleTemplateClick(template)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{categoryIcons[template.category]}</span>
                        <h4 className="text-sm font-medium truncate text-white">{template.name}</h4>
                      </div>
                      <p className="text-xs text-white/60 line-clamp-2">
                        {template.description}
                      </p>
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 bg-blue-500/20 text-blue-300 border-blue-500/30"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
