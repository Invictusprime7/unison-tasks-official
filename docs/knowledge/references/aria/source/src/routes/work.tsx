import { createFileRoute, Link } from "@tanstack/react-router";
import { PageIntro, SitePage } from "@/components/SiteChrome";
import { projects } from "@/lib/portfolio-data";

export const Route = createFileRoute("/work")({
  head: () => ({ meta: [
    { title: "Work — ARIA by Ariann Norori" },
    { name: "description", content: "Selected children’s illustration, character design, editorial, and digital art projects by Ariann Norori." },
    { property: "og:title", content: "Work — ARIA" },
    { property: "og:description", content: "A curated index of imaginative illustration, character, and digital art projects." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: WorkPage,
});

function WorkPage() {
  return <SitePage atmospheric><main>
    <PageIntro eyebrow="Selected work · 2022—2024" title="Stories, characters, and digital worlds." copy="A selection of my commissioned and self-directed work. Select an image to enter its process and case study." />
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-x-8 gap-y-24 px-6 pb-32 sm:grid-cols-12 sm:px-10">
      {projects.map((project, index) => <article key={project.slug} className={`${project.size === "wide" ? "sm:col-span-8" : "sm:col-span-4"} ${index % 2 ? "sm:mt-24" : ""} group`}>
        <Link to="/process/$slug" params={{ slug: project.slug }}>
          <div className={`${project.size === "portrait" ? "aspect-[3/4]" : project.size === "square" ? "aspect-square" : "aspect-[16/9]"} overflow-hidden bg-card`}>
            <img src={project.image} alt={project.alt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          </div>
          <p className="mt-5 font-mono text-xs uppercase text-primary">{project.index} · {project.discipline}</p>
          <h2 className="mt-2 font-serif text-3xl italic">{project.title}</h2>
          <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">{project.summary}</p>
        </Link>
      </article>)}
    </section>
  </main></SitePage>;
}