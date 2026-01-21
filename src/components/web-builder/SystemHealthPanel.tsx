/**
 * SystemHealthPanel
 * Shows intent status and publish readiness for the current system
 */

import React, { useMemo } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Activity, 
  Zap,
  Shield,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  getSystemContract, 
  type SystemContract,
  type PublishCheck 
} from '@/data/templates/contracts';
import { isValidIntent } from '@/runtime/intentRouter';
import type { BusinessSystemType } from '@/data/templates/types';

interface IntentStatus {
  intent: string;
  label: string;
  status: 'wired' | 'mocked' | 'broken';
  required: boolean;
}

interface SystemHealthPanelProps {
  systemType: BusinessSystemType | null;
  preloadedIntents?: string[];
  onPublishCheck?: () => void;
  className?: string;
}

const intentLabels: Record<string, string> = {
  'booking.create': 'Create Booking',
  'reservation.submit': 'Submit Reservation',
  'contact.submit': 'Contact Form',
  'contact.sales': 'Sales Inquiry',
  'project.inquire': 'Project Inquiry',
  'quote.request': 'Quote Request',
  'cart.add': 'Add to Cart',
  'cart.view': 'View Cart',
  'checkout.start': 'Start Checkout',
  'demo.request': 'Request Demo',
  'trial.start': 'Start Trial',
  'pricing.select': 'Select Pricing',
  'newsletter.subscribe': 'Newsletter Signup',
};

export const SystemHealthPanel: React.FC<SystemHealthPanelProps> = ({
  systemType,
  preloadedIntents = [],
  onPublishCheck,
  className,
}) => {
  const contract = useMemo(() => {
    return systemType ? getSystemContract(systemType) : undefined;
  }, [systemType]);

  const intentStatuses = useMemo((): IntentStatus[] => {
    if (!contract) return [];

    const allIntents = [...new Set([...contract.requiredIntents, ...preloadedIntents])];
    
    return allIntents.map(intent => {
      const isWired = isValidIntent(intent);
      const isRequired = contract.requiredIntents.includes(intent);
      
      return {
        intent,
        label: intentLabels[intent] || intent,
        status: isWired ? 'wired' : 'mocked',
        required: isRequired,
      };
    });
  }, [contract, preloadedIntents]);

  const healthScore = useMemo(() => {
    if (intentStatuses.length === 0) return 0;
    const wiredCount = intentStatuses.filter(s => s.status === 'wired').length;
    return Math.round((wiredCount / intentStatuses.length) * 100);
  }, [intentStatuses]);

  const requiredMet = useMemo(() => {
    const required = intentStatuses.filter(s => s.required);
    const wired = required.filter(s => s.status === 'wired');
    return { total: required.length, met: wired.length };
  }, [intentStatuses]);

  if (!systemType || !contract) {
    return (
      <Card className={cn("bg-card border-border", className)}>
        <CardContent className="p-4 text-center text-muted-foreground">
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Select a system to view health status</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: IntentStatus['status']) => {
    switch (status) {
      case 'wired':
        return <CheckCircle2 className="w-4 h-4 text-primary" />;
      case 'mocked':
        return <AlertCircle className="w-4 h-4 text-accent-foreground" />;
      case 'broken':
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusBadge = (status: IntentStatus['status']) => {
    switch (status) {
      case 'wired':
        return <Badge variant="default" className="text-[10px] px-1.5 py-0">Live</Badge>;
      case 'mocked':
        return <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-accent text-accent-foreground">Demo</Badge>;
      case 'broken':
        return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Broken</Badge>;
    }
  };

  const isPublishReady = requiredMet.met === requiredMet.total && healthScore >= 80;

  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            System Health
          </CardTitle>
          <Badge 
            variant={isPublishReady ? "default" : "secondary"}
            className={cn(
              "text-xs",
              isPublishReady && "bg-primary text-primary-foreground"
            )}
          >
            {isPublishReady ? 'Ready to Publish' : 'Not Ready'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Health Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Intent Coverage</span>
            <span className="font-medium">{healthScore}%</span>
          </div>
          <Progress value={healthScore} className="h-2" />
        </div>

        {/* Required Intents Status */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm">Required Intents</span>
          </div>
          <span className={cn(
            "text-sm font-medium",
            requiredMet.met === requiredMet.total ? "text-primary" : "text-destructive"
          )}>
            {requiredMet.met}/{requiredMet.total}
          </span>
        </div>

        <Separator />

        {/* Intent List */}
        <div className="space-y-1">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Intent Status
          </h4>
          <ScrollArea className="h-[200px]">
            <div className="space-y-1">
              {intentStatuses.map((status) => (
                <div
                  key={status.intent}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.status)}
                    <span className="text-sm">{status.label}</span>
                    {status.required && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0 border-primary/30 text-primary">
                        Required
                      </Badge>
                    )}
                  </div>
                  {getStatusBadge(status.status)}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Publish Checks Preview */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Publish Checks
          </h4>
          {contract.publishChecks.slice(0, 3).map((check) => (
            <div 
              key={check.id}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <div className={cn(
                "w-1.5 h-1.5 rounded-full",
                check.severity === 'error' ? 'bg-destructive' : 
                check.severity === 'warning' ? 'bg-accent-foreground' : 'bg-muted-foreground'
              )} />
              <span>{check.label}</span>
            </div>
          ))}
        </div>

        {/* Publish Button */}
        <Button
          className="w-full"
          disabled={!isPublishReady}
          onClick={onPublishCheck}
        >
          {isPublishReady ? 'Run Publish Checks' : 'Complete Required Intents'}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default SystemHealthPanel;
