import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';

type Template = Database['public']['Tables']['templates']['Row'];
type TemplateInsert = Database['public']['Tables']['templates']['Insert'];
type TemplateUpdate = Database['public']['Tables']['templates']['Update'];

// Type definitions for backend features
export interface TemplateRedirect {
  id: string;
  path: string;
  destination: string;
  statusCode: 301 | 302 | 307 | 308;
  enabled: boolean;
}

export interface TemplateScheduling {
  publishAt?: string;
  unpublishAt?: string;
  timezone?: string;
  recurring?: {
    enabled: boolean;
    cron?: string;
    action: 'publish' | 'unpublish' | 'toggle';
  };
}

export interface TemplatePayment {
  enabled: boolean;
  provider?: 'stripe' | 'paypal' | 'custom';
  priceId?: string;
  amount?: number;
  currency?: string;
  mode?: 'payment' | 'subscription';
  successUrl?: string;
  cancelUrl?: string;
  webhookSecret?: string;
}

export interface TemplateBackendConfig {
  redirects: TemplateRedirect[];
  scheduling: TemplateScheduling;
  requires_auth: boolean;
  payment: TemplatePayment;
}

// Edge function API helper
async function callTemplateBackend(action: string, params: Record<string, string> = {}, body?: any) {
  const queryParams = new URLSearchParams({ action, ...params });
  const { data, error } = await supabase.functions.invoke('template-backend', {
    body: body ? JSON.stringify(body) : undefined,
    method: body ? 'POST' : 'GET',
  });

  // Handle the response from the edge function
  if (error) throw error;
  return data;
}

export function useTemplateBackend() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch all templates for the current user
  const fetchTemplates = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('templates')
        .select('*')
        .eq('owner_id', userId)
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;
      return data as Template[];
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error fetching templates',
        description: err.message,
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create a new template
  const createTemplate = useCallback(async (template: TemplateInsert) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('templates')
        .insert(template)
        .select()
        .single();

      if (insertError) throw insertError;
      toast({
        title: 'Template created',
        description: `"${template.name}" has been created.`,
      });
      return data as Template;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error creating template',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update an existing template
  const updateTemplate = useCallback(async (id: string, updates: TemplateUpdate) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase
        .from('templates')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      toast({
        title: 'Template updated',
        description: 'Template has been updated successfully.',
      });
      return data as Template;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error updating template',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Delete a template
  const deleteTemplate = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error: deleteError } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      toast({
        title: 'Template deleted',
        description: 'Template has been deleted.',
      });
      return true;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error deleting template',
        description: err.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update template redirects
  const updateRedirects = useCallback(async (id: string, redirects: TemplateRedirect[]) => {
    return updateTemplate(id, { redirects: redirects as any });
  }, [updateTemplate]);

  // Update template scheduling
  const updateScheduling = useCallback(async (id: string, scheduling: TemplateScheduling) => {
    return updateTemplate(id, { scheduling: scheduling as any });
  }, [updateTemplate]);

  // Update template authentication requirement
  const updateRequiresAuth = useCallback(async (id: string, requires_auth: boolean) => {
    return updateTemplate(id, { requires_auth });
  }, [updateTemplate]);

  // Update template payment configuration
  const updatePayment = useCallback(async (id: string, payment: TemplatePayment) => {
    return updateTemplate(id, { payment: payment as any });
  }, [updateTemplate]);

  // Get full backend configuration for a template
  const getBackendConfig = useCallback((template: Template): TemplateBackendConfig => {
    return {
      redirects: (template.redirects as unknown as TemplateRedirect[] | null) || [],
      scheduling: (template.scheduling as unknown as TemplateScheduling | null) || {},
      requires_auth: template.requires_auth || false,
      payment: (template.payment as unknown as TemplatePayment | null) || { enabled: false },
    };
  }, []);

  // Update full backend configuration for a template
  const updateBackendConfig = useCallback(async (id: string, config: Partial<TemplateBackendConfig>) => {
    const updates: TemplateUpdate = {};
    if (config.redirects !== undefined) updates.redirects = config.redirects as any;
    if (config.scheduling !== undefined) updates.scheduling = config.scheduling as any;
    if (config.requires_auth !== undefined) updates.requires_auth = config.requires_auth;
    if (config.payment !== undefined) updates.payment = config.payment as any;
    return updateTemplate(id, updates);
  }, [updateTemplate]);

  // Publish a template (set status to published)
  const publishTemplate = useCallback(async (id: string) => {
    return updateTemplate(id, { status: 'published' });
  }, [updateTemplate]);

  // Archive a template
  const archiveTemplate = useCallback(async (id: string) => {
    return updateTemplate(id, { status: 'archived' });
  }, [updateTemplate]);

  // Duplicate a template
  const duplicateTemplate = useCallback(async (id: string, newName?: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data: original, error: fetchError } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const duplicate: TemplateInsert = {
        ...original,
        id: undefined,
        name: newName || `${original.name} (Copy)`,
        status: 'draft',
        usage_count: 0,
        download_count: 0,
        like_count: 0,
        created_at: undefined,
        updated_at: undefined,
      };

      const { data, error: insertError } = await supabase
        .from('templates')
        .insert(duplicate)
        .select()
        .single();

      if (insertError) throw insertError;
      toast({
        title: 'Template duplicated',
        description: `"${duplicate.name}" has been created.`,
      });
      return data as Template;
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error duplicating template',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Check if a path matches any template redirect (via Edge Function)
  const checkRedirect = useCallback(async (path: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('template-backend', {
        body: { action: 'check-redirect', path },
      });
      if (error) throw error;
      return data as { redirect: boolean; destination?: string; statusCode?: number; templateId?: string };
    } catch (err: any) {
      console.error('Error checking redirect:', err);
      return { redirect: false };
    }
  }, []);

  // Check if user has access to a template (via Edge Function)
  const checkAccess = useCallback(async (templateId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('template-backend', {
        body: { action: 'check-access', templateId },
      });
      if (error) throw error;
      return data as { access: boolean; reason?: string };
    } catch (err: any) {
      console.error('Error checking access:', err);
      return { access: false, reason: err.message };
    }
  }, []);

  // Create a payment session for a template (via Edge Function)
  const createPaymentSession = useCallback(async (templateId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('template-backend', {
        body: { action: 'create-payment-session', templateId },
      });
      if (error) throw error;
      return data as { sessionId?: string; url?: string; error?: string };
    } catch (err: any) {
      console.error('Error creating payment session:', err);
      toast({
        title: 'Payment error',
        description: err.message,
        variant: 'destructive',
      });
      return { error: err.message };
    }
  }, [toast]);

  // Verify a payment session (via Edge Function)
  const verifyPayment = useCallback(async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('template-backend', {
        body: { action: 'verify-payment', sessionId },
      });
      if (error) throw error;
      return data as { verified: boolean; templateId?: string; customerEmail?: string };
    } catch (err: any) {
      console.error('Error verifying payment:', err);
      return { verified: false };
    }
  }, []);

  return {
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    updateRedirects,
    updateScheduling,
    updateRequiresAuth,
    updatePayment,
    getBackendConfig,
    updateBackendConfig,
    publishTemplate,
    archiveTemplate,
    duplicateTemplate,
    // Edge function-based methods
    checkRedirect,
    checkAccess,
    createPaymentSession,
    verifyPayment,
  };
}
