# Unison Tasks

**All-in-One Business Automation Platform with AI-Powered Web Generation**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E)](https://supabase.com)

---

## Executive Summary

Unison Tasks is an enterprise-grade business automation platform that combines AI-powered website generation, workflow automation, CRM, and task management into a unified solution. Built for modern businesses that demand more than disconnected tools, Unison Tasks delivers the power of multiple SaaS platforms through a single, intelligent interface.

### Problem Statement

Small to medium-sized businesses face a critical integration challenge:
- Marketing teams use website builders (Webflow, Wix)
- Sales teams use CRMs (HubSpot, Salesforce)
- Operations teams use automation tools (Zapier, GoHighLevel)
- Development teams maintain custom integrations

**Result**: Fragmented data, duplicated workflows, escalating costs, and technical debt.

### Our Solution

Unison Tasks eliminates fragmentation by providing:
- **AI-Generated Websites** from natural language prompts
- **Universal Intent System** for deterministic user journey routing
- **Industry-Specific Automation** with pre-built workflow recipes
- **Integrated CRM** with pipeline management and lead scoring
- **Visual Workflow Builder** with conditional logic and branching
- **Multi-Tenant Architecture** with enterprise RBAC and audit logging

---

## Core Features

### 1. AI-Powered Web Builder

Generate production-ready websites from natural language using Google Gemini 2.5 Flash:

- **9+ Template Categories**: Portfolio, Restaurant, E-commerce, SaaS, Contractor, Blog, Digital Creator
- **Multi-Variant Generation**: A/B/C design experiments with distinct aesthetics
- **Canvas-Based Editor**: Full Fabric.js integration for visual editing
- **Export to Production**: HTML/CSS/JS with design system tokens
- **Sandboxed Preview**: Isolated iframe with RPC communication

**Technical Differentiator**: Dual-mode rendering from a single template schema - editable canvas for designers, optimized HTML for production.

### 2. Universal Intent System

Deterministic routing for 25+ intent types with 95% accuracy:

**Intent Categories**:
- **Navigation**: Internal routing, external links, anchor scrolling
- **Commerce**: Add to cart, checkout, coupon application
- **Booking**: Reservations, confirmations, calendar integration
- **Lead Capture**: Form submissions, quote requests
- **Automation Triggers**: Button clicks, form events

**Architecture**: Rule-based engine handles 95% of intents deterministically, AI fallback for ambiguous cases. Intents are pre-annotated at build time, eliminating runtime AI dependency.

### 3. Automation Recipes Engine

Event-driven workflow automation with 17+ automation intent types:

- **Industry-Specific Packs**: Salon, Restaurant, Contractor, E-commerce, Agency workflows
- **DAG-Based Workflows**: Trigger → Condition → Action → Goal node types
- **Business Hour Guardrails**: Quiet hours, rate limiting, deduplication windows
- **Action Types**: Email, SMS, Task creation, Lead generation, Pipeline movement, Webhooks, Delays

**Workflow Examples**:
- Booking confirmation → Send SMS → Add to calendar → Send reminder 24h before
- Cart abandonment → Wait 1 hour → Send email with 10% coupon
- Lead capture → Score qualification → Route to sales team → Create follow-up task

### 4. Enterprise CRM

- Lead and contact management with custom fields
- Pipeline stages with deal tracking
- Contact tagging and segmentation
- Activity timeline and interaction history
- Lead scoring and qualification rules
- Quote and booking management

### 5. Design Studio

- Canvas-based design editor with component library
- Design tokens system (colors, typography, spacing)
- Brand kit management with style guides
- Asset management and image optimization
- Real-time collaboration (coming soon)

### 6. Multi-Tenant Organization Model

- Organization/workspace hierarchy with projects
- Role-Based Access Control (RBAC) with 12+ permission types
- Project-level permissions for team collaboration
- Subscription/billing integration with usage quotas
- Audit logging for compliance and governance

---

## Technical Architecture

### Frontend Stack

```
React 19 + TypeScript 5.9
├── UI Framework: Radix UI + Shadcn components
├── Styling: Tailwind CSS 3.4 + Design tokens
├── State: React Query 5 (TanStack) + Custom hooks
├── Canvas: Fabric.js 6.7 (design editing)
├── Code Editor: Monaco Editor + CodeMirror
├── Forms: React Hook Form + Zod validation
├── Motion: Framer Motion for animations
└── Routing: React Router v7
```

### Backend Infrastructure

```
Supabase (PostgreSQL + Edge Functions)
├── Auth: JWT-based authentication with refresh tokens
├── Database: PostgreSQL with Row-Level Security (RLS)
├── Edge Functions: Deno runtime for AI integration
├── Realtime: WebSockets for live updates
└── Storage: Asset management and CDN
```

### Preview & Execution

```
Docker-Based Preview Service
├── API Gateway: Express.js with TypeScript
├── Worker Pool: Isolated Docker containers
├── Session Manager: Lifecycle and resource limits
├── VFS: In-memory virtual file system
├── RPC Layer: PostMessage for iframe communication
└── Monitoring: AWS CloudWatch integration
```

### Security Model

**Multi-Layer Defense**:
1. **Database Layer**: Row-Level Security (RLS) for tenant isolation
2. **API Layer**: RBAC with granular permission checks
3. **Preview Layer**: Sandboxed iframe + Docker container isolation
4. **Network Layer**: AWS WAF + VPC restrictions
5. **Audit Layer**: Comprehensive action logging for compliance

**Compliance Ready**: SOC 2 architecture with audit trails, access controls, and data encryption

---

## Key Technical Differentiators

### 1. Schema-Driven Development

Template schema serves as single source of truth:
- Renders to editable Fabric.js canvas (designer mode)
- Exports to production HTML/CSS/JS (runtime mode)
- Supports data binding from CRM (dynamic content)
- Enables variant generation (A/B testing)

**Benefit**: No sync issues between design and production - one schema, multiple outputs.

### 2. Deterministic Runtime

Unlike competitors relying on AI at runtime:
- Intents resolved at build time (95% via rules)
- Predictable button behavior without API calls
- Offline-capable exported sites
- Sub-50ms intent routing latency

**Benefit**: Predictable UX, lower operational costs, no runtime AI dependencies.

### 3. Industry-Specific Recipes

Pre-built automation workflows tailored to verticals:
- Salon: Booking reminders, no-show tracking, review requests
- Restaurant: Reservation confirmations, waitlist management, delivery updates
- Contractor: Quote follow-ups, project milestones, invoice reminders
- E-commerce: Cart abandonment, order fulfillment, loyalty programs

**Benefit**: Businesses inherit best practices instead of building from scratch.

### 4. Resource Quota System

Organization-level quotas with real-time enforcement:
- Concurrent preview sessions
- Daily AI generations
- File upload limits
- API rate limiting

**Benefit**: Predictable costs, abuse prevention, fair resource allocation.

---

## Competitive Positioning

| Platform | Web Builder | Automation | CRM | AI Generation | Industry Recipes |
|----------|-------------|------------|-----|---------------|------------------|
| **Unison Tasks** | ✅ Canvas + Code | ✅ Visual DAG | ✅ Native | ✅ Templates | ✅ Pre-built |
| Webflow | ✅ Visual | ❌ | ❌ | ❌ | ❌ |
| GoHighLevel | ⚠️ Basic | ✅ Advanced | ✅ Native | ❌ | ⚠️ Manual |
| Figma/Framer | ✅ Design-first | ❌ | ❌ | ⚠️ Limited | ❌ |
| Zapier/Make | ❌ | ✅ Integration | ❌ | ❌ | ❌ |

**Unique Value**: Only platform combining AI website generation, deterministic automation, and native CRM with industry-specific templates.

---

## Data Model Overview

### Core Entities

**Templates & Design**:
- `templates` - Design schemas with component definitions
- `template_variants` - A/B/C design experiments
- `design_tokens` - Color systems, typography, spacing
- `brand_kits` - Brand guidelines and style guides
- `assets` - Images, fonts, media files

**Automation**:
- `automation_workflows` - DAG-based workflow definitions
- `automation_nodes` - Trigger/Action/Condition/Wait/Goal nodes
- `automation_edges` - Connections between nodes
- `automation_runs` - Execution instances with state
- `automation_jobs` - Scheduled and queued jobs
- `automation_events` - Event log for triggers
- `automation_recipe_packs` - Industry-specific workflow templates
- `business_automation_settings` - Guardrails (hours, rate limits)

**CRM**:
- `contacts` - Customer and lead records
- `leads` - Sales opportunities with scoring
- `pipelines` - Deal stages and progression
- `pipeline_stages` - Customizable stage definitions
- `activities` - Interaction timeline and history
- `tags` - Contact segmentation and categorization

**Organization**:
- `organizations` - Multi-tenant workspaces
- `projects` - Website and campaign projects
- `team_members` - User roles and permissions
- `organization_entitlements` - Subscription quotas
- `audit_logs` - Compliance and security tracking

---

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0.17+
- Supabase account (local or cloud)
- Docker (for preview service)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/unison-tasks.git
cd unison-tasks

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env.local
# Configure Supabase URL and API keys
```

### Running Locally

```bash
# Start Supabase locally
npx supabase start

# Run database migrations
npx supabase db push

# Start development server
npm run dev
# or
bun run dev
```

### Preview Service

```bash
# Navigate to preview service
cd preview-service

# Install dependencies
npm install

# Start Docker service
npm run start
```

---

## Development

### Project Structure

```
unison-tasks/
├── src/
│   ├── components/       # React components
│   ├── services/         # Business logic and API clients
│   │   ├── aiIntegrationService.ts
│   │   ├── designIntentCompiler.ts
│   │   ├── sceneExporter.ts
│   │   ├── templateRenderer.ts
│   │   └── automationEngine.ts
│   ├── runtime/          # Universal intent system
│   │   ├── intentResolver.ts
│   │   ├── actionCatalog.ts
│   │   └── universalIntentRouter.ts
│   ├── types/            # TypeScript definitions
│   │   ├── automation.ts
│   │   ├── template.ts
│   │   └── intents.ts
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Utility functions
├── preview-service/      # Docker-based preview runtime
│   ├── src/
│   │   ├── gateway/      # Express API
│   │   ├── workers/      # Docker orchestration
│   │   └── vfs/          # Virtual file system
├── supabase/
│   ├── functions/        # Edge Functions (Deno)
│   │   ├── generate-template/
│   │   ├── process-automation/
│   │   └── resolve-intent/
│   └── migrations/       # Database schema
└── docs/                 # Architecture documentation
```

### Key Commands

```bash
# Development
npm run dev              # Start Vite dev server
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # ESLint checks
npm run type-check       # TypeScript validation

# Supabase
npx supabase start       # Start local Supabase
npx supabase db reset    # Reset database with migrations
npx supabase gen types typescript # Generate TypeScript types
```

---

## Architecture Documentation

For detailed technical documentation, see:

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Template rendering pipeline
- [AUTOMATION_RECIPES_ENGINE.md](docs/AUTOMATION_RECIPES_ENGINE.md) - Workflow automation
- [UNIVERSAL_INTENT_SYSTEM.md](docs/UNIVERSAL_INTENT_SYSTEM.md) - Intent routing
- [ENTERPRISE_HARDENING.md](docs/ENTERPRISE_HARDENING.md) - Security & compliance
- [BUILD_TO_CANVAS_WORKFLOW.md](docs/BUILD_TO_CANVAS_WORKFLOW.md) - Designer workflows

---

## Roadmap

### Q1 2026
- Real-time collaboration (multi-user canvas editing)
- Advanced A/B testing with analytics
- Shopify/WooCommerce integration
- SSO/SAML enterprise authentication

### Q2 2026
- Mobile app builder (React Native templates)
- AI-powered content generation (blog posts, product descriptions)
- Advanced workflow analytics dashboard
- White-label reseller program

### Q3 2026
- Custom component marketplace
- API platform for third-party integrations
- Multi-language support (i18n)
- Advanced reporting and business intelligence

### Q4 2026
- AI agent automation (autonomous task execution)
- Voice and video integration
- Advanced permissions with approval workflows
- Enterprise service agreements (SLA)

---

## Contributing

We welcome contributions from the community. Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Security

Security is foundational to Unison Tasks. We implement:

- Row-Level Security (RLS) for data isolation
- JWT-based authentication with token rotation
- RBAC with 12+ granular permission types
- Docker container isolation for preview runtime
- AWS WAF for DDoS protection
- Comprehensive audit logging
- Regular security audits and penetration testing

**Report vulnerabilities**: security@unison-tasks.com

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Enterprise Support

For enterprise licensing, custom deployments, or partnership inquiries:

- **Email**: enterprise@unison-tasks.com
- **Sales**: sales@unison-tasks.com
- **Documentation**: https://docs.unison-tasks.com
- **Status Page**: https://status.unison-tasks.com

---

## Metrics & Performance

### Platform Statistics
- **Template Generation**: <5 seconds for full website
- **Intent Resolution**: <50ms average latency
- **Database Queries**: <100ms p95 (with RLS)
- **Preview Launch**: <2 seconds for Docker worker
- **Export Time**: <3 seconds for production HTML/CSS/JS

### Scalability
- Supports 10,000+ concurrent users per region
- Handles 1M+ automation jobs per day
- Processes 100K+ intent resolutions per minute
- Stores 10TB+ of design assets

---

## Built With

- [React](https://reactjs.org/) - UI framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Supabase](https://supabase.com) - Backend infrastructure
- [Fabric.js](http://fabricjs.com/) - Canvas editing
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI generation
- [Tailwind CSS](https://tailwindcss.com/) - Styling system
- [Docker](https://www.docker.com/) - Container runtime
- [Radix UI](https://www.radix-ui.com/) - Component primitives

---

## Acknowledgments

- Powered by Google Gemini 2.5 Flash for AI generation
- Built on Supabase open-source infrastructure
- Inspired by the best of Webflow, GoHighLevel, and Figma
- Community feedback and contributions from 100+ beta testers

---

**Ready to revolutionize your business operations?** Start building with Unison Tasks today.

[Get Started](https://unison-tasks.com/signup) | [Documentation](https://docs.unison-tasks.com) | [Demo](https://demo.unison-tasks.com) | [Community](https://community.unison-tasks.com)
