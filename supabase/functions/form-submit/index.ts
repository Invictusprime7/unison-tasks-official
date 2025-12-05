import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { formId, formName, data, sourceUrl } = body;

    console.log("Form submission received:", { formId, formName, data });

    // Get client info
    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown";
    const userAgent = req.headers.get("user-agent") || "unknown";

    // Store the form submission
    const { data: submission, error: submitError } = await supabase
      .from("crm_form_submissions")
      .insert({
        form_id: formId,
        form_name: formName,
        data,
        source_url: sourceUrl,
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (submitError) {
      console.error("Error storing submission:", submitError);
      throw new Error("Failed to store form submission");
    }

    console.log("Form submission stored:", submission.id);

    // Auto-create or update contact if email is present
    let contactId = null;
    const email = data.email || data.Email || data.EMAIL;
    
    if (email) {
      // Check if contact exists
      const { data: existingContact } = await supabase
        .from("crm_contacts")
        .select("id")
        .eq("email", email.toLowerCase())
        .maybeSingle();

      if (existingContact) {
        contactId = existingContact.id;
        
        // Update contact with new data
        const updates: any = { updated_at: new Date().toISOString() };
        if (data.firstName || data.first_name || data.name) {
          updates.first_name = data.firstName || data.first_name || data.name?.split(" ")[0];
        }
        if (data.lastName || data.last_name || data.name) {
          updates.last_name = data.lastName || data.last_name || data.name?.split(" ").slice(1).join(" ");
        }
        if (data.phone || data.Phone) {
          updates.phone = data.phone || data.Phone;
        }
        if (data.company || data.Company) {
          updates.company = data.company || data.Company;
        }

        await supabase
          .from("crm_contacts")
          .update(updates)
          .eq("id", contactId);
      } else {
        // Create new contact
        const { data: newContact, error: contactError } = await supabase
          .from("crm_contacts")
          .insert({
            email: email.toLowerCase(),
            first_name: data.firstName || data.first_name || data.name?.split(" ")[0],
            last_name: data.lastName || data.last_name || data.name?.split(" ").slice(1).join(" "),
            phone: data.phone || data.Phone,
            company: data.company || data.Company,
            source: `form:${formId}`,
            custom_fields: { form_submission_id: submission.id, original_data: data },
          })
          .select()
          .single();

        if (!contactError && newContact) {
          contactId = newContact.id;
          console.log("New contact created:", contactId);
        }
      }
    }

    // Check for workflows triggered by this form
    const { data: workflows } = await supabase
      .from("crm_workflows")
      .select("*")
      .eq("is_active", true)
      .eq("trigger_type", "form_submit");

    let triggeredWorkflows: string[] = [];

    for (const workflow of workflows || []) {
      const config = workflow.trigger_config || {};
      
      // Check if workflow should trigger for this form
      if (config.formId && config.formId !== formId) continue;
      if (config.formIds && !config.formIds.includes(formId)) continue;

      console.log(`Triggering workflow: ${workflow.name} (${workflow.id})`);

      // Create workflow run
      const { data: workflowRun, error: runError } = await supabase
        .from("crm_workflow_runs")
        .insert({
          workflow_id: workflow.id,
          status: "running",
          trigger_data: {
            form_id: formId,
            form_name: formName,
            submission_id: submission.id,
            contact_id: contactId,
            form_data: data,
          },
        })
        .select()
        .single();

      if (runError) {
        console.error(`Error creating run for workflow ${workflow.id}:`, runError);
        continue;
      }

      // Queue jobs for each step
      const steps = workflow.steps || [];
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        
        // Inject form data into action config
        const actionConfig = {
          ...step.config,
          _formData: data,
          _contactId: contactId,
          _submissionId: submission.id,
        };

        await supabase.from("crm_workflow_jobs").insert({
          workflow_run_id: workflowRun.id,
          step_index: i,
          action_type: step.action_type,
          action_config: actionConfig,
          status: "queued",
          scheduled_at: new Date().toISOString(),
        });
      }

      // Trigger job processor
      await supabase.functions.invoke("workflow-job-processor", {
        body: { workflowRunId: workflowRun.id },
      });

      triggeredWorkflows.push(workflow.id);
    }

    // Update submission to mark workflow triggered
    if (triggeredWorkflows.length > 0) {
      await supabase
        .from("crm_form_submissions")
        .update({ workflow_triggered: true })
        .eq("id", submission.id);
    }

    // Check for automations triggered by form submission
    const { data: automations } = await supabase
      .from("crm_automations")
      .select("*")
      .eq("is_active", true)
      .eq("trigger_event", "form_submitted");

    for (const automation of automations || []) {
      console.log(`Running automation: ${automation.name}`);
      // Process automation actions (simplified)
      for (const action of automation.actions || []) {
        if (action.type === "create_activity" && contactId) {
          await supabase.from("crm_activities").insert({
            activity_type: "note",
            title: `Form submission: ${formName || formId}`,
            description: `Contact submitted form with data: ${JSON.stringify(data)}`,
            contact_id: contactId,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        submissionId: submission.id,
        contactId,
        triggeredWorkflows,
        message: "Form submitted successfully",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in form-submit:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
