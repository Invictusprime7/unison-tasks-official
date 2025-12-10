/**
 * Layout Templates
 * Pre-built HTML templates for different industries and use cases
 */

export type LayoutCategory =
  | "landing"
  | "portfolio"
  | "restaurant"
  | "ecommerce"
  | "blog"
  | "contractor"
  | "agency"
  | "startup";

export interface LayoutTemplate {
  id: string;
  name: string;
  category: LayoutCategory;
  description: string;
  thumbnail?: string;
  code: string;
  tags?: string[];
}

// Helper: wrap body content into a full HTML doc with Tailwind
const wrapInHtmlDoc = (body: string, title: string = "AI Web Builder Template") => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-white">
  ${body}
</body>
</html>`;

export const layoutTemplates: LayoutTemplate[] = [
  // LANDING PAGE
  {
    id: "landing-saas-a",
    name: "SaaS Landing (A)",
    category: "landing",
    description: "Hero + feature grid + CTA footer.",
    tags: ["saas", "hero", "features", "modern"],
    code: wrapInHtmlDoc(`
      <main class="min-h-screen flex flex-col">
        <section class="px-6 py-16 lg:px-16 lg:py-24">
          <div class="max-w-5xl mx-auto grid gap-10 lg:grid-cols-2 items-center">
            <div>
              <span class="inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-400 px-3 py-1 text-xs font-medium mb-4">
                New • AI-powered web builder
              </span>
              <h1 class="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-4">
                Launch beautiful websites in minutes, not weeks.
              </h1>
              <p class="text-sm md:text-base text-slate-300 mb-6">
                Drag, drop, and let AI generate layouts, copy, and code—then export straight into your stack.
              </p>
              <div class="flex flex-col sm:flex-row gap-3">
                <button class="px-5 py-2.5 rounded-md bg-emerald-500 text-sm font-medium hover:bg-emerald-600 transition">
                  Start building
                </button>
                <button class="px-5 py-2.5 rounded-md border border-white/10 text-sm font-medium hover:bg-white/5 transition">
                  Watch demo
                </button>
              </div>
            </div>
            <div class="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl">
              <div class="h-64 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/10 to-purple-500/20 flex items-center justify-center text-xs text-slate-300">
                Canvas preview area
              </div>
            </div>
          </div>
        </section>
        <section class="px-6 pb-16 lg:px-16">
          <div class="max-w-5xl mx-auto">
            <h2 class="text-lg font-semibold mb-4">Why teams use Unison Tasks</h2>
            <div class="grid gap-5 md:grid-cols-3">
              <div class="bg-slate-900/60 border border-white/5 rounded-xl p-4 hover:bg-slate-900 transition">
                <h3 class="text-sm font-semibold mb-1">Template library</h3>
                <p class="text-xs text-slate-400">Start from polished layouts for SaaS, portfolios, and ecommerce.</p>
              </div>
              <div class="bg-slate-900/60 border border-white/5 rounded-xl p-4 hover:bg-slate-900 transition">
                <h3 class="text-sm font-semibold mb-1">AI design assistant</h3>
                <p class="text-xs text-slate-400">Iterate copy and sections without leaving the editor.</p>
              </div>
              <div class="bg-slate-900/60 border border-white/5 rounded-xl p-4 hover:bg-slate-900 transition">
                <h3 class="text-sm font-semibold mb-1">Production-ready code</h3>
                <p class="text-xs text-slate-400">Export clean HTML/CSS and connect to your backend.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    `, "SaaS Landing Page"),
  },
];

// Helper functions
export const getTemplatesByCategory = (category: LayoutCategory): LayoutTemplate[] => {
  return layoutTemplates.filter(t => t.category === category);
};

export const getTemplateById = (id: string): LayoutTemplate | undefined => {
  return layoutTemplates.find(t => t.id === id);
};

export const searchTemplates = (query: string): LayoutTemplate[] => {
  const lowercaseQuery = query.toLowerCase();
  return layoutTemplates.filter(t => 
    t.name.toLowerCase().includes(lowercaseQuery) ||
    t.description.toLowerCase().includes(lowercaseQuery) ||
    t.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

export const getAllCategories = (): LayoutCategory[] => {
  return Array.from(new Set(layoutTemplates.map(t => t.category)));
};
