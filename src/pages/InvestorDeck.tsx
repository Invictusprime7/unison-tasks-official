import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InvestorDeck = () => {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const content = contentRef.current?.innerHTML || "";
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Unison Tasks — Platform Overview</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Inter', sans-serif; color: #1a1a2e; background: #fff; line-height: 1.6; }
          .deck-container { max-width: 900px; margin: 0 auto; padding: 48px 40px; }
          .deck-header { text-align: center; margin-bottom: 56px; padding-bottom: 40px; border-bottom: 2px solid #e8e8ef; }
          .deck-logo { font-size: 14px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; color: #7c5cfc; margin-bottom: 24px; }
          .deck-title { font-size: 36px; font-weight: 900; color: #1a1a2e; margin-bottom: 12px; line-height: 1.2; }
          .deck-subtitle { font-size: 18px; color: #6b7280; font-weight: 400; }
          .deck-date { font-size: 13px; color: #9ca3af; margin-top: 16px; }
          .deck-section { margin-bottom: 48px; }
          .deck-section-title { font-size: 22px; font-weight: 800; color: #1a1a2e; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 3px solid #7c5cfc; display: inline-block; }
          .deck-section-desc { font-size: 15px; color: #6b7280; margin-bottom: 24px; }
          .deck-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .deck-card { background: #f8f7ff; border: 1px solid #e8e5f7; border-radius: 12px; padding: 24px; }
          .deck-card-title { font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 6px; }
          .deck-card-text { font-size: 13px; color: #6b7280; line-height: 1.6; }
          .deck-card-badge { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #7c5cfc; background: #ede9fe; padding: 3px 10px; border-radius: 100px; margin-bottom: 10px; }
          .deck-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 48px; }
          .deck-stat { text-align: center; background: linear-gradient(135deg, #7c5cfc 0%, #a78bfa 100%); border-radius: 12px; padding: 24px 16px; color: #fff; }
          .deck-stat-value { font-size: 32px; font-weight: 900; }
          .deck-stat-label { font-size: 12px; font-weight: 500; opacity: 0.85; margin-top: 4px; }
          .deck-arch { background: #0f0f23; color: #e2e8f0; border-radius: 12px; padding: 32px; margin-bottom: 48px; }
          .deck-arch pre { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 12px; line-height: 1.7; white-space: pre; overflow-x: auto; }
          .deck-list { list-style: none; padding: 0; }
          .deck-list li { padding: 10px 0; border-bottom: 1px solid #f0f0f5; font-size: 14px; color: #374151; display: flex; align-items: flex-start; gap: 10px; }
          .deck-list li::before { content: "→"; color: #7c5cfc; font-weight: 700; flex-shrink: 0; }
          .deck-list li:last-child { border-bottom: none; }
          .deck-full { grid-column: 1 / -1; }
          .deck-table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .deck-table th { text-align: left; font-weight: 700; color: #7c5cfc; padding: 10px 12px; border-bottom: 2px solid #e8e5f7; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
          .deck-table td { padding: 10px 12px; border-bottom: 1px solid #f0f0f5; color: #374151; }
          .deck-footer { text-align: center; margin-top: 56px; padding-top: 32px; border-top: 2px solid #e8e8ef; color: #9ca3af; font-size: 13px; }
          @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .deck-stat { -webkit-print-color-adjust: exact; } .deck-arch { -webkit-print-color-adjust: exact; } }
          @media (max-width: 640px) { .deck-grid { grid-template-columns: 1fr; } .deck-stats { grid-template-columns: repeat(2, 1fr); } }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => { printWindow.print(); }, 500);
  };

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky toolbar */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button onClick={handleDownload} size="sm">
          <Download className="h-4 w-4 mr-2" /> Download PDF
        </Button>
      </div>

      {/* Document */}
      <div ref={contentRef}>
        <div className="deck-container" style={{ maxWidth: 900, margin: "0 auto", padding: "48px 40px", fontFamily: "'Inter', sans-serif", color: "#1a1a2e", lineHeight: 1.6 }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 56, paddingBottom: 40, borderBottom: "2px solid #e8e8ef" }}>
            <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" as const, color: "#7c5cfc", marginBottom: 24 }}>UNISON TASKS</div>
            <h1 style={{ fontSize: 36, fontWeight: 900, color: "#1a1a2e", marginBottom: 12, lineHeight: 1.2 }}>Platform Features &amp; System Infrastructure</h1>
            <p style={{ fontSize: 18, color: "#6b7280", fontWeight: 400 }}>The Operating System for Small Business</p>
            <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 16 }}>Confidential — {today}</p>
          </div>

          {/* At a Glance */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 48 }}>
            {[
              { value: "40+", label: "Edge Functions" },
              { value: "8", label: "Industry Verticals" },
              { value: "24", label: "Premium Templates" },
              { value: "5", label: "Core Intents" },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center", background: "linear-gradient(135deg, #7c5cfc 0%, #a78bfa 100%)", borderRadius: 12, padding: "24px 16px", color: "#fff" }}>
                <div style={{ fontSize: 32, fontWeight: 900 }}>{s.value}</div>
                <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.85, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Executive Summary */}
          <Section title="Executive Summary">
            <p style={{ fontSize: 15, color: "#374151", marginBottom: 16 }}>
              Unison Tasks is a vertically-integrated SaaS platform that transforms small businesses into digitally-automated operations. It combines a <strong>no-code website builder</strong>, <strong>CRM &amp; pipeline management</strong>, <strong>AI-powered automation engine</strong>, and <strong>multi-channel lead capture</strong> into a single operating system — eliminating the need for 5-7 separate software subscriptions.
            </p>
            <p style={{ fontSize: 15, color: "#374151" }}>
              The platform's core value loop: <em>a visitor fills a form on a business's site → the owner is immediately notified via email → the lead is captured in the CRM dashboard</em>. Every feature strengthens this cycle.
            </p>
          </Section>

          {/* Core Platform Modules */}
          <Section title="Core Platform Modules">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card badge="Builder" title="Website Builder & Template Engine" text="Visual drag-and-drop builder with industry-specific templates. Real-time preview via sandboxed iframe. In-place DOM patching for instant edits. CodeMirror & Monaco code editors for power users. 24 premium templates across 8 industries." />
              <Card badge="CRM" title="CRM & Sales Pipeline" text="Contact management, lead scoring, deal tracking. Visual kanban pipeline (Prospecting → Negotiation → Won/Lost). Drag-and-drop deal movement triggers automations. Activity logging, form submissions, and email templates." />
              <Card badge="Automation" title="Workflow Automation Engine" text="DAG-based workflow execution with branching logic. Industry-specific recipe packs (Salon, Restaurant, Contractor, etc.). Business hours & quiet hours enforcement. Rate limiting, deduplication, and loop prevention." />
              <Card badge="AI" title="AI Agent Orchestration" text="Plugin-based agent registry with per-business configuration. Deterministic intent routing with spam guard as first-line defense. Agent chaining for sequential workflows (lead_qualifier → auto_responder). Background AI infrastructure — no chatbot overlays." />
              <Card badge="Cloud" title="Cloud Dashboard & Infrastructure" text="Businesses, projects, assets, email, and integrations management. Entitlement-gated features with subscription tiers. Live preview service with ECS Fargate containers and HMR. Auto-scaling from 2-10 gateway instances." />
              <Card badge="Design" title="Design Studio & Creative Tools" text="Canvas-based design editor with layer system. Image editor, video editor, and AI image generation. Brand kit management (colors, fonts, logos). Export to PNG, SVG, PDF with configurable DPI." />
            </div>
          </Section>

          {/* Intent System */}
          <Section title="Intent-Driven Architecture" desc="Every user interaction maps to a semantic intent, providing a universal event bus for the entire platform.">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", fontWeight: 700, color: "#7c5cfc", padding: "10px 12px", borderBottom: "2px solid #e8e5f7", fontSize: 12, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Intent</th>
                  <th style={{ textAlign: "left", fontWeight: 700, color: "#7c5cfc", padding: "10px 12px", borderBottom: "2px solid #e8e5f7", fontSize: 12, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Trigger</th>
                  <th style={{ textAlign: "left", fontWeight: 700, color: "#7c5cfc", padding: "10px 12px", borderBottom: "2px solid #e8e5f7", fontSize: 12, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["contact.submit", "Contact form submission", "CRM entry + owner notification"],
                  ["newsletter.subscribe", "Email signup widget", "Mailing list + welcome sequence"],
                  ["booking.create", "Appointment calendar", "Booking record + confirmation email"],
                  ["quote.request", "Quote/estimate form", "Lead created + follow-up workflow"],
                  ["lead.capture", "Any conversion CTA", "Lead scoring + pipeline entry"],
                  ["nav.goto / nav.anchor", "Internal navigation", "Client-side routing"],
                  ["pay.checkout", "Purchase action", "Stripe integration"],
                ].map(([intent, trigger, result]) => (
                  <tr key={intent}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f5", color: "#374151", fontFamily: "monospace", fontWeight: 600 }}>{intent}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f5", color: "#374151" }}>{trigger}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f5", color: "#374151" }}>{result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* System Architecture */}
          <Section title="System Architecture">
            <div style={{ background: "#0f0f23", color: "#e2e8f0", borderRadius: 12, padding: 32 }}>
              <pre style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 12, lineHeight: 1.7, whiteSpace: "pre", overflowX: "auto" as const }}>{`
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│
│  │ Web      │ │ CRM      │ │ Design   │ │ Cloud    │ │ AI     ││
│  │ Builder  │ │ Pipeline │ │ Studio   │ │ Dashboard│ │ Agents ││
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └───┬────┘│
│       │            │            │            │            │     │
│       └────────────┴────────────┼────────────┴────────────┘     │
│                                 │                               │
│                    ┌────────────▼────────────┐                  │
│                    │    INTENT ROUTER        │                  │
│                    │  (Event Bus + Routing)  │                  │
│                    └────────────┬────────────┘                  │
└─────────────────────────────────┼───────────────────────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │    LOVABLE CLOUD (Backend) │
                    │                           │
                    │  ┌───────────────────────┐│
                    │  │   40+ Edge Functions  ││
                    │  │  intent-router        ││
                    │  │  automation-runtime   ││
                    │  │  agent-runner         ││
                    │  │  systems-build        ││
                    │  │  workflow-trigger     ││
                    │  │  publish-site         ││
                    │  │  create-lead          ││
                    │  │  form-submit          ││
                    │  └───────────────────────┘│
                    │                           │
                    │  ┌───────────────────────┐│
                    │  │   PostgreSQL + RLS    ││
                    │  │  30+ tables with      ││
                    │  │  row-level security   ││
                    │  └───────────────────────┘│
                    │                           │
                    │  ┌───────────────────────┐│
                    │  │  File Storage + Auth  ││
                    │  └───────────────────────┘│
                    └───────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                  PREVIEW SERVICE (AWS ECS Fargate)               │
│  ┌──────────┐     ┌──────────┐     ┌──────────────────┐         │
│  │ ALB      │────▶│ Gateway  │────▶│ Vite Workers     │         │
│  │ (HTTPS)  │     │ (Express)│     │ (Docker + HMR)   │         │
│  └──────────┘     └──────────┘     └──────────────────┘         │
│  Auto-scaling: 2-10 instances  |  50 concurrent sessions       │
└──────────────────────────────────────────────────────────────────┘`}</pre>
            </div>
          </Section>

          {/* Edge Functions */}
          <Section title="Backend Functions (40+)" desc="Serverless functions handling all business logic, AI orchestration, and integrations.">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card badge="Intent & Routing" title="Core Event Processing" text="intent-router / intent-router-lite — Routes all semantic intents to handlers. intent-action — Executes intent-specific business logic. form-submit — Processes form submissions with validation. plugin-event-ingest — AI agent event intake." />
              <Card badge="Automation" title="Workflow Engine" text="automation-event — Ingests events, deduplicates, finds matching workflows. automation-runtime — Executes DAG-based workflow steps. workflow-trigger / workflow-cron — Scheduled and event-driven triggers. workflow-job-processor — Processes delayed automation jobs." />
              <Card badge="AI" title="AI Services" text="agent-runner — Orchestrates AI agent execution with tool calls. ai-code-assistant / ai-web-assistant — Code and web generation. ai-design-assistant — Design suggestions and generation. generate-template / generate-ai-template — Template synthesis." />
              <Card badge="Business" title="Business Operations" text="create-lead / create-lead-lite — Lead capture and scoring. create-booking — Appointment management. systems-build / systems-classify / systems-compile — System provisioning. publish-site — Static site deployment." />
            </div>
          </Section>

          {/* Industry Templates */}
          <Section title="Industry Template Library" desc="24 premium templates across 8 verticals — each with dark, light, and bold variants.">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", fontWeight: 700, color: "#7c5cfc", padding: "10px 12px", borderBottom: "2px solid #e8e5f7", fontSize: 12, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Industry</th>
                  <th style={{ textAlign: "left", fontWeight: 700, color: "#7c5cfc", padding: "10px 12px", borderBottom: "2px solid #e8e5f7", fontSize: 12, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Dark Luxury</th>
                  <th style={{ textAlign: "left", fontWeight: 700, color: "#7c5cfc", padding: "10px 12px", borderBottom: "2px solid #e8e5f7", fontSize: 12, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Light Modern</th>
                  <th style={{ textAlign: "left", fontWeight: 700, color: "#7c5cfc", padding: "10px 12px", borderBottom: "2px solid #e8e5f7", fontSize: 12, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Bold Editorial</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Salon & Spa", "Premium luxury spa", "Airy wellness center", "Magazine editorial"],
                  ["Restaurant", "Fine dining", "Casual bistro", "Farm-to-table"],
                  ["Local Service", "Professional contractor", "Friendly neighborhood", "Emergency/urgent"],
                  ["E-commerce", "Fashion store", "Product showcase", "Lifestyle brand"],
                  ["Coaching", "Executive coaching", "Warm & approachable", "Bold motivational"],
                  ["Real Estate", "Luxury properties", "Modern listings", "Investment focus"],
                  ["Portfolio", "Minimal dark showcase", "Light gallery", "Experimental"],
                  ["Nonprofit", "Mission-driven", "Clean institutional", "Impact-focused"],
                ].map(([industry, d, l, b]) => (
                  <tr key={industry}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f5", color: "#374151", fontWeight: 600 }}>{industry}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f5", color: "#374151" }}>{d}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f5", color: "#374151" }}>{l}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f5", color: "#374151" }}>{b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Automation Recipe Packs */}
          <Section title="Automation Recipe Packs" desc="Pre-built workflow templates activated when a business launches a system.">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card badge="Salon" title="Salon Pack" text="Booking Confirmation → 24hr Reminder → Post-appointment Review Request. Fully automated client communication lifecycle." />
              <Card badge="Restaurant" title="Restaurant Pack" text="Reservation Confirmation → 2hr Reminder → No-Show Follow-up. Reduces no-shows and captures feedback." />
              <Card badge="Contractor" title="Contractor Pack" text="Quote Follow-up → Lead Nurture Sequence → Job Completion Review. Converts estimates into booked jobs." />
              <Card badge="E-commerce" title="E-commerce Pack" text="Order Confirmation → Abandoned Cart Recovery → Post-Purchase Review. Maximizes conversion and retention." />
            </div>
          </Section>

          {/* AI Agent System */}
          <Section title="AI Agent Orchestration Layer" desc="Background AI that users sense through outcomes, not chatbot interfaces.">
            <ul style={{ listStyle: "none", padding: 0 }}>
              {[
                "Plugin-based agent registry — each agent has a slug, system prompt, allowed tools, and tier",
                "Per-business agent instances with custom config and placement keys",
                "Deterministic intent routing: UI emits request → router maps to agent based on business context",
                "Spam guard as mandatory first-line defense for all submission intents",
                "Agent chaining rules for sequential workflows (e.g., lead_qualifier.hot_lead → auto_responder)",
                "Event-driven execution: ai_events → ai_runs → tool_calls with latency and token tracking",
                "State persistence per plugin instance for long-running agent contexts",
              ].map((item) => (
                <li key={item} style={{ padding: "10px 0", borderBottom: "1px solid #f0f0f5", fontSize: 14, color: "#374151", display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ color: "#7c5cfc", fontWeight: 700, flexShrink: 0 }}>→</span>{item}
                </li>
              ))}
            </ul>
          </Section>

          {/* Infrastructure */}
          <Section title="Infrastructure & DevOps">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card badge="Compute" title="Preview Service" text="AWS ECS Fargate with Docker-based Vite workers. Express gateway manages session lifecycle with HMR support. Auto-scaling 2-10 instances, 50 concurrent preview sessions." />
              <Card badge="Database" title="PostgreSQL + RLS" text="30+ tables with row-level security policies. Real-time subscriptions via Postgres changes. Automatic type generation from schema." />
              <Card badge="IaC" title="Terraform Managed" text="Full infrastructure-as-code: ECS cluster, ALB, ECR repos, CloudWatch, IAM roles, auto-scaling policies. S3 backend with DynamoDB locking." />
              <Card badge="Security" title="Security Model" text="RLS on all user-facing tables. JWT-based authentication. HTTPS everywhere (TLS 1.3). Container image scanning on push. Private subnets for compute." />
            </div>
          </Section>

          {/* Database Schema Overview */}
          <Section title="Database Schema (30+ Tables)" desc="Core tables organized by domain, all with row-level security.">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card badge="Business" title="Business Domain" text="businesses, business_members, business_installs, business_automation_settings, business_design_preferences, business_recipe_toggles, intent_bindings" />
              <Card badge="CRM" title="CRM Domain" text="crm_contacts, crm_leads, crm_deals, crm_activities, crm_automations, crm_workflows, crm_workflow_runs, crm_workflow_jobs, crm_form_submissions, crm_email_templates" />
              <Card badge="AI" title="AI Domain" text="ai_agent_registry, ai_plugin_instances, ai_plugin_state, ai_events, ai_runs, ai_learning_sessions, ai_code_patterns" />
              <Card badge="Content" title="Content Domain" text="documents, document_history, generated_pages, design_templates, files, file_versions, file_attachments, brand_kits, layers, pages" />
            </div>
          </Section>

          {/* Competitive Positioning */}
          <Section title="Competitive Positioning">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", fontWeight: 700, color: "#7c5cfc", padding: "10px 12px", borderBottom: "2px solid #e8e5f7", fontSize: 12, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Capability</th>
                  <th style={{ textAlign: "center", fontWeight: 700, color: "#7c5cfc", padding: "10px 12px", borderBottom: "2px solid #e8e5f7", fontSize: 12, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Unison</th>
                  <th style={{ textAlign: "center", fontWeight: 700, color: "#7c5cfc", padding: "10px 12px", borderBottom: "2px solid #e8e5f7", fontSize: 12, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>GoHighLevel</th>
                  <th style={{ textAlign: "center", fontWeight: 700, color: "#7c5cfc", padding: "10px 12px", borderBottom: "2px solid #e8e5f7", fontSize: 12, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>Wix</th>
                  <th style={{ textAlign: "center", fontWeight: 700, color: "#7c5cfc", padding: "10px 12px", borderBottom: "2px solid #e8e5f7", fontSize: 12, textTransform: "uppercase" as const, letterSpacing: 0.5 }}>HubSpot</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Website Builder", "✓", "✓", "✓", "✓"],
                  ["CRM + Pipeline", "✓", "✓", "✗", "✓"],
                  ["Workflow Automation", "✓", "✓", "✗", "$$"],
                  ["AI Agents (Background)", "✓", "✗", "✗", "✗"],
                  ["Industry Templates", "✓", "Partial", "✓", "✗"],
                  ["Intent-Driven Events", "✓", "✗", "✗", "✗"],
                  ["Design Studio", "✓", "✗", "Partial", "✗"],
                  ["Code-Level Access", "✓", "✗", "Partial", "✗"],
                  ["Single Platform", "✓", "✓", "✗", "✗"],
                ].map(([cap, u, g, w, h]) => (
                  <tr key={cap}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f5", color: "#374151", fontWeight: 500 }}>{cap}</td>
                    {[u, g, w, h].map((v, i) => (
                      <td key={i} style={{ padding: "10px 12px", borderBottom: "1px solid #f0f0f5", textAlign: "center", color: v === "✓" ? "#16a34a" : v === "✗" ? "#dc2626" : "#d97706", fontWeight: 700 }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Tech Stack */}
          <Section title="Technology Stack">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <Card badge="Frontend" title="Client Application" text="React 19 + TypeScript + Vite. Tailwind CSS + shadcn/ui component library. Framer Motion animations. TanStack Query for data fetching. React Router v7. CodeMirror & Monaco editors." />
              <Card badge="Backend" title="Server Infrastructure" text="PostgreSQL with 30+ tables and RLS. 40+ Deno Edge Functions. Real-time subscriptions. JWT authentication. File storage with versioning." />
              <Card badge="AI" title="AI & ML" text="Multi-model support (GPT-5, Gemini 2.5/3, etc.). Deterministic intent routing. Plugin-based agent architecture. Learning sessions and code pattern storage." />
              <Card badge="Infra" title="Cloud & DevOps" text="AWS ECS Fargate (preview service). Terraform IaC. Docker containerization. ECR with image scanning. CloudWatch monitoring. Auto-scaling policies." />
            </div>
          </Section>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: 56, paddingTop: 32, borderTop: "2px solid #e8e8ef", color: "#9ca3af", fontSize: 13 }}>
            <p style={{ fontWeight: 700, color: "#7c5cfc", marginBottom: 4 }}>UNISON TASKS</p>
            <p>Confidential — For Investor &amp; Endorser Review Only</p>
            <p style={{ marginTop: 4 }}>{today}</p>
          </div>

        </div>
      </div>
    </div>
  );
};

// Inline sub-components
const Section = ({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 48 }}>
    <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e", marginBottom: 8, paddingBottom: 8, borderBottom: "3px solid #7c5cfc", display: "inline-block" }}>{title}</h2>
    {desc && <p style={{ fontSize: 15, color: "#6b7280", marginBottom: 24 }}>{desc}</p>}
    {!desc && <div style={{ marginBottom: 24 }} />}
    {children}
  </div>
);

const Card = ({ badge, title, text }: { badge: string; title: string; text: string }) => (
  <div style={{ background: "#f8f7ff", border: "1px solid #e8e5f7", borderRadius: 12, padding: 24 }}>
    <span style={{ display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" as const, color: "#7c5cfc", background: "#ede9fe", padding: "3px 10px", borderRadius: 100, marginBottom: 10 }}>{badge}</span>
    <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", marginBottom: 6 }}>{title}</div>
    <div style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6 }}>{text}</div>
  </div>
);

export default InvestorDeck;
