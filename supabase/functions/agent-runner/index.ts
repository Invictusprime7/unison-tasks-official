import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

// Tool registry - maps tool IDs to handlers
// deno-lint-ignore no-explicit-any
type ToolHandler = (payload: Record<string, unknown>, context: ToolContext) => Promise<Record<string, unknown>>

interface ToolContext {
  // deno-lint-ignore no-explicit-any
  supabase: any
  businessId: string
  pluginInstanceId: string | null
}

const toolHandlers: Record<string, ToolHandler> = {
  'crm.lead.create': async (payload, context) => {
    const { data, error } = await context.supabase
      .from('crm_leads')
      .insert({
        business_id: context.businessId,
        name: payload.name as string,
        email: payload.email as string,
        title: `Lead: ${payload.name || payload.email}`,
        metadata: { score: payload.score, source: 'ai_agent' },
        status: 'new',
        intent: payload.intent as string || 'contact.submit',
      })
      .select('id')
      .single()

    if (error) throw new Error(`Failed to create lead: ${error.message}`)
    console.log('[agent-runner] Created lead:', data.id)
    return { leadId: data.id, success: true }
  },

  'notify.team': async (payload, context) => {
    // Get business notification email
    const { data: business } = await context.supabase
      .from('businesses')
      .select('notification_email, owner_id')
      .eq('id', context.businessId)
      .single()

    let notifyEmail = business?.notification_email

    // Fallback to owner's profile email
    if (!notifyEmail && business?.owner_id) {
      const { data: profile } = await context.supabase
        .from('profiles')
        .select('id')
        .eq('id', business.owner_id)
        .single()
      
      // In real implementation, would get email from auth.users
      // For now, log the notification
      console.log('[agent-runner] notify.team - would notify owner:', business.owner_id)
    }

    console.log('[agent-runner] notify.team:', {
      to: notifyEmail || 'owner',
      message: payload.message,
      leadScore: payload.score,
    })

    return { notified: true, channel: 'email' }
  },

  'pipeline.stage.set': async (payload, context) => {
    if (!payload.leadId) {
      throw new Error('leadId is required for pipeline.stage.set')
    }

    const { error } = await context.supabase
      .from('crm_leads')
      .update({ status: payload.stage as string })
      .eq('id', payload.leadId)
      .eq('business_id', context.businessId)

    if (error) throw new Error(`Failed to update pipeline stage: ${error.message}`)
    
    console.log('[agent-runner] pipeline.stage.set:', payload.leadId, '->', payload.stage)
    return { updated: true, stage: payload.stage }
  },
}

// Execute a single tool call
async function executeTool(
  toolId: string,
  payload: Record<string, unknown>,
  context: ToolContext
): Promise<{ success: boolean; result?: Record<string, unknown>; error?: string }> {
  const handler = toolHandlers[toolId]
  if (!handler) {
    console.warn('[agent-runner] Unknown tool:', toolId)
    return { success: false, error: `Unknown tool: ${toolId}` }
  }

  try {
    const result = await handler(payload, context)
    return { success: true, result }
  } catch (err) {
    const error = err as Error
    console.error('[agent-runner] Tool execution failed:', toolId, error)
    return { success: false, error: error.message }
  }
}

// Call LLM with agent system prompt
async function callLLM(
  systemPrompt: string,
  userPayload: Record<string, unknown>
): Promise<{ score: number; tags: string[]; stage: string; notes: string; proposedToolCalls: Array<{ tool: string; payload: Record<string, unknown> }> }> {
  const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
  
  if (!lovableApiKey) {
    console.error('[agent-runner] LOVABLE_API_KEY not configured')
    throw new Error('LLM service not configured')
  }

  const response = await fetch('https://api.lovable.dev/api/v1/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${lovableApiKey}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(userPayload, null, 2) },
      ],
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('[agent-runner] LLM call failed:', response.status, errorText)
    throw new Error(`LLM call failed: ${response.status}`)
  }

  const result = await response.json()
  const content = result.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('No content in LLM response')
  }

  try {
    return JSON.parse(content)
  } catch {
    console.error('[agent-runner] Failed to parse LLM response as JSON:', content)
    throw new Error('Invalid JSON response from LLM')
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse optional request body for specific event processing
    let targetEventId: string | null = null
    try {
      const body = await req.json()
      targetEventId = body?.eventId || null
    } catch {
      // No body or invalid JSON - process next pending event
    }

    // Claim a pending event (with lease timeout recovery)
    const leaseTimeoutMinutes = 5
    const leaseThreshold = new Date(Date.now() - leaseTimeoutMinutes * 60 * 1000).toISOString()

    let eventQuery = supabase
      .from('ai_events')
      .select('*')
      .or(`status.eq.pending,and(status.eq.processing,locked_at.lt.${leaseThreshold})`)
      .order('created_at', { ascending: true })
      .limit(1)

    if (targetEventId) {
      eventQuery = supabase
        .from('ai_events')
        .select('*')
        .eq('id', targetEventId)
        .limit(1)
    }

    const { data: events, error: fetchError } = await eventQuery

    if (fetchError) {
      console.error('[agent-runner] Failed to fetch events:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch events' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!events || events.length === 0) {
      console.log('[agent-runner] No pending events')
      return new Response(
        JSON.stringify({ status: 'idle', message: 'No pending events' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const event = events[0]
    const runnerId = `runner-${crypto.randomUUID().slice(0, 8)}`

    console.log('[agent-runner] Processing event:', {
      eventId: event.id,
      intent: event.intent,
      businessId: event.business_id,
      runnerId,
    })

    // Lock the event
    const { error: lockError } = await supabase
      .from('ai_events')
      .update({
        status: 'processing',
        locked_at: new Date().toISOString(),
        locked_by: runnerId,
      })
      .eq('id', event.id)

    if (lockError) {
      console.error('[agent-runner] Failed to lock event:', lockError)
      return new Response(
        JSON.stringify({ error: 'Failed to lock event' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create run record
    const { data: run, error: runError } = await supabase
      .from('ai_runs')
      .insert({
        event_id: event.id,
        plugin_instance_id: event.plugin_instance_id,
        business_id: event.business_id,
        status: 'processing',
        input_payload: event.payload,
      })
      .select('id')
      .single()

    if (runError) {
      console.error('[agent-runner] Failed to create run record:', runError)
      // Continue anyway - run record is for audit, not critical path
    }

    // Link event to run
    if (run) {
      await supabase
        .from('ai_events')
        .update({ claimed_run_id: run.id })
        .eq('id', event.id)
    }

    // Get agent configuration
    let systemPrompt: string
    let allowedTools: string[]

    if (event.plugin_instance_id) {
      // Get from plugin instance -> agent registry
      const { data: instance } = await supabase
        .from('ai_plugin_instances')
        .select(`
          config,
          agent:ai_agent_registry(
            system_prompt,
            allowed_tools
          )
        `)
        .eq('id', event.plugin_instance_id)
        .single()

      // Handle joined agent data (could be array or object depending on Supabase version)
      const agentData = Array.isArray(instance?.agent) ? instance.agent[0] : instance?.agent
      if (agentData) {
        systemPrompt = agentData.system_prompt
        allowedTools = agentData.allowed_tools || []
      } else {
        // Fallback to default lead qualifier
        const { data: defaultAgent } = await supabase
          .from('ai_agent_registry')
          .select('system_prompt, allowed_tools')
          .eq('slug', 'lead_qualifier')
          .single()

        systemPrompt = defaultAgent?.system_prompt || 'You are a helpful assistant. Respond with JSON.'
        allowedTools = defaultAgent?.allowed_tools || []
      }
    } else {
      // No plugin instance - use default lead qualifier
      const { data: defaultAgent } = await supabase
        .from('ai_agent_registry')
        .select('system_prompt, allowed_tools')
        .eq('slug', 'lead_qualifier')
        .single()

      systemPrompt = defaultAgent?.system_prompt || 'You are a helpful assistant. Respond with JSON.'
      allowedTools = defaultAgent?.allowed_tools || []
    }

    // Call LLM
    let llmResult: Awaited<ReturnType<typeof callLLM>>
    let tokensUsed = 0

    try {
      llmResult = await callLLM(systemPrompt, {
        intent: event.intent,
        ...event.payload,
      })
      console.log('[agent-runner] LLM response:', llmResult)
    } catch (err) {
      const error = err as Error
      console.error('[agent-runner] LLM call failed:', error)

      // Update event and run as failed
      await supabase
        .from('ai_events')
        .update({ status: 'failed', processed_at: new Date().toISOString() })
        .eq('id', event.id)

      if (run) {
        await supabase
          .from('ai_runs')
          .update({
            status: 'failed',
            error_message: error.message,
            completed_at: new Date().toISOString(),
            latency_ms: Date.now() - startTime,
          })
          .eq('id', run.id)
      }

      return new Response(
        JSON.stringify({ status: 'failed', error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Execute proposed tool calls
    const toolCallResults: Array<{ tool: string; success: boolean; result?: unknown; error?: string }> = []
    const toolContext: ToolContext = {
      supabase,
      businessId: event.business_id,
      pluginInstanceId: event.plugin_instance_id,
    }

    for (const toolCall of llmResult.proposedToolCalls || []) {
      // Verify tool is allowed
      if (!allowedTools.includes(toolCall.tool)) {
        console.warn('[agent-runner] Tool not allowed:', toolCall.tool)
        toolCallResults.push({
          tool: toolCall.tool,
          success: false,
          error: 'Tool not authorized for this agent',
        })
        continue
      }

      const result = await executeTool(toolCall.tool, toolCall.payload, toolContext)
      toolCallResults.push({
        tool: toolCall.tool,
        ...result,
      })
    }

    // Update plugin state if instance exists
    if (event.plugin_instance_id) {
      await supabase
        .from('ai_plugin_state')
        .upsert({
          plugin_instance_id: event.plugin_instance_id,
          state_key: 'latest_analysis',
          state: {
            score: llmResult.score,
            tags: llmResult.tags,
            stage: llmResult.stage,
            notes: llmResult.notes,
            lastProcessedAt: new Date().toISOString(),
            lastEventId: event.id,
          },
        }, {
          onConflict: 'plugin_instance_id,state_key',
        })
    }

    // Mark event as completed
    await supabase
      .from('ai_events')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
      })
      .eq('id', event.id)

    // Update run record
    const latencyMs = Date.now() - startTime
    if (run) {
      await supabase
        .from('ai_runs')
        .update({
          status: 'completed',
          output_payload: llmResult,
          tool_calls: toolCallResults,
          tokens_used: tokensUsed,
          latency_ms: latencyMs,
          completed_at: new Date().toISOString(),
        })
        .eq('id', run.id)
    }

    console.log('[agent-runner] Event processed successfully:', {
      eventId: event.id,
      runId: run?.id,
      latencyMs,
      toolCallsExecuted: toolCallResults.length,
    })

    return new Response(
      JSON.stringify({
        status: 'completed',
        eventId: event.id,
        runId: run?.id,
        result: {
          score: llmResult.score,
          stage: llmResult.stage,
          tags: llmResult.tags,
        },
        toolCalls: toolCallResults,
        latencyMs,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[agent-runner] Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
