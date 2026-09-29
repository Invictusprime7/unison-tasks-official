import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SitePage } from "@/components/SiteChrome";
import { getProject, projects } from "@/lib/portfolio-data";

export const Route = createFileRoute("/process/$slug")({
  loader: ({ params }) => { const project = getProject(params.slug); if (!project) throw notFound(); return project; },
  head: ({ loaderData }) => ({ meta: [
    { title: loaderData ? `${loaderData.title} Case Study — ARIA` : "Case Study — ARIA" },
    { name: "description", content: loaderData?.summary ?? "An ARIA project case study by Ariann Norori." },
    { property: "og:title", content: loaderData ? `${loaderData.title} — ARIA Process` : "ARIA Process" },
    { property: "og:description", content: loaderData?.summary ?? "Ariann Norori’s creative process." },
    { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: ProjectProcess,
});

function ProjectProcess() {
  const project = Route.useLoaderData();
  const next = projects[(projects.findIndex(item => item.slug === project.slug) + 1) % projects.length];
  return <SitePage><main>
    <header className="mx-auto max-w-7xl px-6 pb-16 pt-40 sm:px-10 sm:pt-48"><p className="font-mono text-xs uppercase text-primary">Case study · {project.index}</p><h1 className="mt-5 font-serif text-4xl font-bold italic leading-tight sm:text-5xl lg:text-6xl">{project.title}</h1><div className="mt-10 flex flex-wrap justify-between gap-5 border-t border-border pt-5 font-mono text-xs uppercase text-muted-foreground"><span>{project.discipline}</span><span>{project.year}</span></div></header>
    <img src={project.image} alt={project.alt} className="max-h-[90vh] w-full object-cover" />
    <section className="mx-auto grid max-w-7xl gap-16 px-6 py-28 sm:grid-cols-12 sm:px-10"><p className="font-serif text-4xl italic leading-tight sm:col-span-5">{project.summary}</p><div className="space-y-12 sm:col-span-6 sm:col-start-7"><CaseBlock label="The challenge" text={project.challenge}/><CaseBlock label="The approach" text={project.approach}/><CaseBlock label="The outcome" text={project.outcome}/></div></section>
    {next ? <section className="border-t border-border px-6 py-24 sm:px-10"><Link to="/process/$slug" params={{ slug: next.slug }} className="mx-auto block max-w-7xl"><p className="font-mono text-xs uppercase text-primary">Next case study</p><p className="mt-5 font-serif text-6xl italic sm:text-8xl">{next.title} →</p></Link></section> : null}
  </main></SitePage>;
}

function CaseBlock({ label, text }: { label: string; text: string }) { return <div><h2 className="font-mono text-xs uppercase text-primary">{label}</h2><p className="mt-4 leading-relaxed text-foreground/75">{text}</p></div>; }