/**
 * Elements Sidebar Demo Page
 * Showcases the drag & drop web builder with professional elements library
 */

import React from 'react';
import { EnhancedWebBuilder } from '@/components/creatives/EnhancedWebBuilder';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Layers, 
  Zap, 
  Palette, 
  Smartphone,
  Code,
  Sparkles
} from 'lucide-react';

const ElementsSidebarDemo = () => {
  const handleSave = (html: string) => {
    console.log('💾 Saved HTML:', html);
    localStorage.setItem('web-builder-draft', html);
  };

  // Load saved draft if exists
  const initialHtml = localStorage.getItem('web-builder-draft') || '';

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 px-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Layers className="w-8 h-8" />
                Drag & Drop Web Builder
              </h1>
              <p className="text-blue-100 text-lg">
                Professional elements library inspired by Webflow, Framer & Wix
              </p>
            </div>
            
            <div className="flex gap-3">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 px-4 py-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <div>
                  <p className="text-xs text-blue-100">Components</p>
                  <p className="text-lg font-bold">50+</p>
                </div>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 px-4 py-3 flex items-center gap-2">
                <Palette className="w-5 h-5 text-pink-300" />
                <div>
                  <p className="text-xs text-blue-100">Categories</p>
                  <p className="text-lg font-bold">8</p>
                </div>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 px-4 py-3 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-300" />
                <div>
                  <p className="text-xs text-blue-100">Responsive</p>
                  <p className="text-lg font-bold">100%</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Features */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
              <Zap className="w-3 h-3 mr-1" />
              Lightning Fast
            </Badge>
            <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
              <Code className="w-3 h-3 mr-1" />
              Perfect HTML
            </Badge>
            <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
              Navigation Components
            </Badge>
            <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
              Hero Sections
            </Badge>
            <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
              Social Media Icons
            </Badge>
            <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
              Form Elements
            </Badge>
            <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
              Card Layouts
            </Badge>
            <Badge className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
              ARIA Accessible
            </Badge>
          </div>
        </div>
      </div>

      {/* Web Builder */}
      <div className="flex-1 overflow-hidden">
        <EnhancedWebBuilder
          initialHtml={initialHtml}
          onSave={handleSave}
        />
      </div>

    </div>
  );
};

export default ElementsSidebarDemo;
