const diagram = `
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
└──────────────────────────────────────────────────────────────────┘`;

const DeckArchDiagram = () => (
  <div className="bg-[#0f0f23] text-[hsl(215,25%,88%)] rounded-xl p-8">
    <pre className="font-mono text-xs leading-relaxed whitespace-pre overflow-x-auto">
      {diagram}
    </pre>
  </div>
);

export default DeckArchDiagram;
