/**
 * CLOUD BUSINESSES - Redirect to Projects Tab
 * 
 * Business management has been moved to the Projects tab.
 * This component provides a redirect notice.
 */

import React from 'react';
import { Building2, FolderKanban, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CloudBusinessesProps {
  userId: string;
  onNavigateToTab?: (tab: string) => void;
}

export function CloudBusinesses({ userId, onNavigateToTab }: CloudBusinessesProps) {
  return (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-purple-500/20 blur-2xl rounded-full" />
          <div className="relative p-6 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-700/50 border border-white/10">
            <Building2 className="h-12 w-12 text-purple-400" />
          </div>
        </div>
        
        <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">
          Relocated
        </Badge>
        
        <h2 className="text-2xl font-bold mb-3">Business Management Moved</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-6">
          Business management, CRM, automations, and team settings have been consolidated 
          into the <strong className="text-white">Projects</strong> tab for a unified experience.
        </p>
        
        <div className="flex gap-3 justify-center">
          <Button 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 gap-2"
            onClick={() => onNavigateToTab?.('projects')}
          >
            <FolderKanban className="h-4 w-4" />
            Go to Projects
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Card className="mt-8 bg-slate-900/50 border-white/10 max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-purple-400" />
              What's in Projects?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-left text-sm text-slate-400 space-y-2">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                Create and manage multiple businesses
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                Access CRM with contacts, leads, and pipeline
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-400" />
                Configure automations and workflows
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Manage team members and permissions
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-pink-400" />
                Organize projects under each business
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
