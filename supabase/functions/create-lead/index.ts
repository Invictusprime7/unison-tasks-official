import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LeadPayload {
  businessId: string;
  name?: string;
  email: string;
  phone?: string;
  source?: string;
  message?: string;
  metadata?: Record<string, unknown>;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    
    const body: LeadPayload = await req.json();
    const { businessId, name, email, phone, source, message, metadata } = body;

    // Validate required fields
    if (!email) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!businessId) {
      return new Response(
        JSON.stringify({ success: false, error: "Business ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate businessId format early to avoid DB 22P02 errors
    if (!isUuid(businessId)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid business ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert lead into database
    const { data: lead, error: insertError } = await supabase
      .from("leads")
      .insert({
        business_id: businessId,
        name: name || null,
        email,
        phone: phone || null,
        source: source || 'web_form',
        message: message || null,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (insertError) {
      console.error("Failed to create lead:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to submit form" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Optionally trigger workflows (check for active workflows)
    try {
      const { data: workflows } = await supabase
        .from("crm_workflows")
        .select("id, steps")
        .eq("trigger_type", "form_submission")
        .eq("is_active", true);

      if (workflows && workflows.length > 0) {
        // Trigger workflow for each matching workflow
        for (const workflow of workflows) {
          await supabase
            .from("crm_workflow_runs")
            .insert({
              workflow_id: workflow.id,
              status: "pending",
              trigger_data: {
                type: "lead_created",
                lead_id: lead.id,
                email,
                source,
              },
            });
        }
      }
    } catch (workflowError) {
      // Log but don't fail the request
      console.warn("Workflow trigger warning:", workflowError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          id: lead.id,
          message: "Thank you! We'll be in touch soon." 
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Create lead error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
