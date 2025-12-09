import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { workflowId, triggerData, webhookSecret } = await req.json();

    console.log("Workflow trigger received:", { workflowId, triggerData });

    // Fetch the workflow
    const { data: workflow, error: workflowError } = await supabase
      .from("crm_workflows")
      .select("*")
      .eq("id", workflowId)
      .eq("is_active", true)
      .maybeSingle();

    if (workflowError) {
      console.error("Error fetching workflow:", workflowError);
      throw new Error("Failed to fetch workflow");
    }

    if (!workflow) {
      return new Response(
        JSON.stringify({ error: "Workflow not found or inactive" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify webhook secret if configured
    if (workflow.trigger_config?.webhookSecret && 
        workflow.trigger_config.webhookSecret !== webhookSecret) {
      return new Response(
        JSON.stringify({ error: "Invalid webhook secret" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the trigger event type for debugging
    const eventType = triggerData?.event || workflow.trigger_type;
    console.log("Processing workflow for event:", eventType);

    // Create workflow run with event context
    const { data: workflowRun, error: runError } = await supabase
      .from("crm_workflow_runs")
      .insert({
        workflow_id: workflowId,
        status: "running",
        trigger_data: {
          ...triggerData,
          event_type: eventType,
          workflow_name: workflow.name,
          triggered_at: new Date().toISOString()
        },
      })
      .select()
      .single();

    if (runError) {
      console.error("Error creating workflow run:", runError);
      throw new Error("Failed to create workflow run");
    }

    console.log("Workflow run created:", workflowRun.id);

    // Queue jobs for each step
    const steps = workflow.steps || [];
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      // Merge trigger data into action config for variable substitution
      const actionConfig = {
        ...step.config,
        _triggerData: triggerData
      };
      
      const { error: jobError } = await supabase
        .from("crm_workflow_jobs")
        .insert({
          workflow_run_id: workflowRun.id,
          step_index: i,
          action_type: step.action_type,
          action_config: actionConfig,
          status: "queued",
          scheduled_at: new Date().toISOString(),
        });

      if (jobError) {
        console.error("Error creating job:", jobError);
      }
    }

    // Trigger job processor
    const processorResponse = await supabase.functions.invoke("workflow-job-processor", {
      body: { workflowRunId: workflowRun.id },
    });

    console.log("Job processor triggered:", processorResponse);

    return new Response(
      JSON.stringify({
        success: true,
        workflowRunId: workflowRun.id,
        eventType,
        message: "Workflow triggered successfully",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in workflow-trigger:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};
