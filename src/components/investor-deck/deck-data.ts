export const modules = [
  {
    badge: "Builder",
    title: "Website Builder & Template Engine",
    text: "Visual drag-and-drop builder with industry-specific templates. Real-time preview via sandboxed iframe. In-place DOM patching for instant edits. CodeMirror & Monaco code editors for power users. 24 premium templates across 8 industries.",
  },
  {
    badge: "CRM",
    title: "CRM & Sales Pipeline",
    text: "Contact management, lead scoring, deal tracking. Visual kanban pipeline (Prospecting → Negotiation → Won/Lost). Drag-and-drop deal movement triggers automations. Activity logging, form submissions, and email templates.",
  },
  {
    badge: "Automation",
    title: "Workflow Automation Engine",
    text: "DAG-based workflow execution with branching logic. Industry-specific recipe packs (Salon, Restaurant, Contractor, etc.). Business hours & quiet hours enforcement. Rate limiting, deduplication, and loop prevention.",
  },
  {
    badge: "AI",
    title: "AI Agent Orchestration",
    text: "Plugin-based agent registry with per-business configuration. Deterministic intent routing with spam guard as first-line defense. Agent chaining for sequential workflows (lead_qualifier → auto_responder). Background AI infrastructure — no chatbot overlays.",
  },
  {
    badge: "Cloud",
    title: "Cloud Dashboard & Infrastructure",
    text: "Businesses, projects, assets, email, and integrations management. Entitlement-gated features with subscription tiers. Live preview service with ECS Fargate containers and HMR. Auto-scaling from 2-10 gateway instances.",
  },
  {
    badge: "Design",
    title: "Design Studio & Creative Tools",
    text: "Canvas-based design editor with layer system. Image editor, video editor, and AI image generation. Brand kit management (colors, fonts, logos). Export to PNG, SVG, PDF with configurable DPI.",
  },
];

export const intentRows = [
  ["contact.submit", "Contact form submission", "CRM entry + owner notification"],
  ["newsletter.subscribe", "Email signup widget", "Mailing list + welcome sequence"],
  ["booking.create", "Appointment calendar", "Booking record + confirmation email"],
  ["quote.request", "Quote/estimate form", "Lead created + follow-up workflow"],
  ["lead.capture", "Any conversion CTA", "Lead scoring + pipeline entry"],
  ["nav.goto / nav.anchor", "Internal navigation", "Client-side routing"],
  ["pay.checkout", "Purchase action", "Stripe integration"],
];

export const edgeFunctions = [
  {
    badge: "Intent & Routing",
    title: "Core Event Processing",
    text: "intent-router / intent-router-lite — Routes all semantic intents to handlers. intent-action — Executes intent-specific business logic. form-submit — Processes form submissions with validation. plugin-event-ingest — AI agent event intake.",
  },
  {
    badge: "Automation",
    title: "Workflow Engine",
    text: "automation-event — Ingests events, deduplicates, finds matching workflows. automation-runtime — Executes DAG-based workflow steps. workflow-trigger / workflow-cron — Scheduled and event-driven triggers. workflow-job-processor — Processes delayed automation jobs.",
  },
  {
    badge: "AI",
    title: "AI Services",
    text: "agent-runner — Orchestrates AI agent execution with tool calls. ai-code-assistant / ai-web-assistant — Code and web generation. ai-design-assistant — Design suggestions and generation. generate-template / generate-ai-template — Template synthesis.",
  },
  {
    badge: "Business",
    title: "Business Operations",
    text: "create-lead / create-lead-lite — Lead capture and scoring. create-booking — Appointment management. systems-build / systems-classify / systems-compile — System provisioning. publish-site — Static site deployment.",
  },
];

export const templateRows = [
  ["Salon & Spa", "Premium luxury spa", "Airy wellness center", "Magazine editorial"],
  ["Restaurant", "Fine dining", "Casual bistro", "Farm-to-table"],
  ["Local Service", "Professional contractor", "Friendly neighborhood", "Emergency/urgent"],
  ["E-commerce", "Fashion store", "Product showcase", "Lifestyle brand"],
  ["Coaching", "Executive coaching", "Warm & approachable", "Bold motivational"],
  ["Real Estate", "Luxury properties", "Modern listings", "Investment focus"],
  ["Portfolio", "Minimal dark showcase", "Light gallery", "Experimental"],
  ["Nonprofit", "Mission-driven", "Clean institutional", "Impact-focused"],
];

export const recipePacks = [
  { badge: "Salon", title: "Salon Pack", text: "Booking Confirmation → 24hr Reminder → Post-appointment Review Request. Fully automated client communication lifecycle." },
  { badge: "Restaurant", title: "Restaurant Pack", text: "Reservation Confirmation → 2hr Reminder → No-Show Follow-up. Reduces no-shows and captures feedback." },
  { badge: "Contractor", title: "Contractor Pack", text: "Quote Follow-up → Lead Nurture Sequence → Job Completion Review. Converts estimates into booked jobs." },
  { badge: "E-commerce", title: "E-commerce Pack", text: "Order Confirmation → Abandoned Cart Recovery → Post-Purchase Review. Maximizes conversion and retention." },
];

export const agentFeatures = [
  "Plugin-based agent registry — each agent has a slug, system prompt, allowed tools, and tier",
  "Per-business agent instances with custom config and placement keys",
  "Deterministic intent routing: UI emits request → router maps to agent based on business context",
  "Spam guard as mandatory first-line defense for all submission intents",
  "Agent chaining rules for sequential workflows (e.g., lead_qualifier.hot_lead → auto_responder)",
  "Event-driven execution: ai_events → ai_runs → tool_calls with latency and token tracking",
  "State persistence per plugin instance for long-running agent contexts",
];

export const infraCards = [
  { badge: "Compute", title: "Preview Service", text: "AWS ECS Fargate with Docker-based Vite workers. Express gateway manages session lifecycle with HMR support. Auto-scaling 2-10 instances, 50 concurrent preview sessions." },
  { badge: "Database", title: "PostgreSQL + RLS", text: "30+ tables with row-level security policies. Real-time subscriptions via Postgres changes. Automatic type generation from schema." },
  { badge: "IaC", title: "Terraform Managed", text: "Full infrastructure-as-code: ECS cluster, ALB, ECR repos, CloudWatch, IAM roles, auto-scaling policies. S3 backend with DynamoDB locking." },
  { badge: "Security", title: "Security Model", text: "RLS on all user-facing tables. JWT-based authentication. HTTPS everywhere (TLS 1.3). Container image scanning on push. Private subnets for compute." },
];

export const dbCards = [
  { badge: "Business", title: "Business Domain", text: "businesses, business_members, business_installs, business_automation_settings, business_design_preferences, business_recipe_toggles, intent_bindings" },
  { badge: "CRM", title: "CRM Domain", text: "crm_contacts, crm_leads, crm_deals, crm_activities, crm_automations, crm_workflows, crm_workflow_runs, crm_workflow_jobs, crm_form_submissions, crm_email_templates" },
  { badge: "AI", title: "AI Domain", text: "ai_agent_registry, ai_plugin_instances, ai_plugin_state, ai_events, ai_runs, ai_learning_sessions, ai_code_patterns" },
  { badge: "Content", title: "Content Domain", text: "documents, document_history, generated_pages, design_templates, files, file_versions, file_attachments, brand_kits, layers, pages" },
];

export const competitiveRows = [
  ["Website Builder", "✓", "✓", "✓", "✓"],
  ["CRM + Pipeline", "✓", "✓", "✗", "✓"],
  ["Workflow Automation", "✓", "✓", "✗", "$$"],
  ["AI Agents (Background)", "✓", "✗", "✗", "✗"],
  ["Industry Templates", "✓", "Partial", "✓", "✗"],
  ["Intent-Driven Events", "✓", "✗", "✗", "✗"],
  ["Design Studio", "✓", "✗", "Partial", "✗"],
  ["Code-Level Access", "✓", "✗", "Partial", "✗"],
  ["Single Platform", "✓", "✓", "✗", "✗"],
];

export const techStackCards = [
  { badge: "Frontend", title: "Client Application", text: "React 19 + TypeScript + Vite. Tailwind CSS + shadcn/ui component library. Framer Motion animations. TanStack Query for data fetching. React Router v7. CodeMirror & Monaco editors." },
  { badge: "Backend", title: "Server Infrastructure", text: "PostgreSQL with 30+ tables and RLS. 40+ Deno Edge Functions. Real-time subscriptions. JWT authentication. File storage with versioning." },
  { badge: "AI", title: "AI & ML", text: "Multi-model support (GPT-5, Gemini 2.5/3, etc.). Deterministic intent routing. Plugin-based agent architecture. Learning sessions and code pattern storage." },
  { badge: "Infra", title: "Cloud & DevOps", text: "AWS ECS Fargate (preview service). Terraform IaC. Docker containerization. ECR with image scanning. CloudWatch monitoring. Auto-scaling policies." },
];
