import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";
import { artist, commissionSteps, projects } from "@/lib/portfolio-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARIA — Ariann Norori, Creative Digital Designer & Artist" },
      { name: "description", content: "ARIA is Ariann Norori’s creative practice spanning children’s illustration, character design, custom digital art, and portfolio experiences. Explore selected work and the commission process." },
      { property: "og:title", content: "ARIA — Ariann Norori" },
      { property: "og:description", content: "Children’s illustration, character design, and custom digital art by Ariann Norori." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function ProcessSlideshow() {
  const [activeStep, setActiveStep] = useState(0);
  const step = commissionSteps[activeStep];
  const image = projects[activeStep];

  const move = (direction: number) => {
    setActiveStep((current) => (current + direction + commissionSteps.length) % commissionSteps.length);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!step || !image) return null;

  return (
    <section aria-label="Commission process slideshow" className="relative border-y border-border bg-card/40 px-6 py-20 sm:px-10 sm:py-28">
      <div className="pointer-events-none absolute left-4 top-0 select-none font-serif text-9xl font-bold italic leading-none text-primary/10 sm:left-10 sm:text-[15rem]" aria-hidden="true">{step[0]}</div>
      <div className="relative mx-auto grid min-h-[42rem] max-w-7xl items-center gap-16 lg:grid-cols-12">
        <div className="relative lg:col-span-7">
          <div className="aspect-[4/5] overflow-hidden bg-muted sm:aspect-[16/10]">
            <img key={image.slug} src={image.image} alt={image.alt} className="ut-process-frame h-full w-full object-cover" />
          </div>
          <div className="relative -mt-12 ml-auto w-4/5 border border-border bg-background p-6 sm:-mr-10 sm:w-2/5 sm:p-8">
            <p className="font-mono text-xs uppercase text-primary">Next chapter</p>
            <p className="mt-4 font-serif text-xl italic leading-snug">{commissionSteps[(activeStep + 1) % commissionSteps.length]?.[2]}</p>
          </div>
        </div>

        <div className="lg:col-span-5 lg:pl-12">
          <p className="font-mono text-xs uppercase text-primary">Phase {step[0]} · {activeStep + 1} of {commissionSteps.length}</p>
          <h2 className="mt-5 font-serif text-5xl font-bold italic leading-none sm:text-7xl">{step[1]}</h2>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">{step[2]}</p>
          <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
            <div className="flex gap-3" aria-label="Choose a process phase">
              {commissionSteps.map(([number, title], index) => <button key={number} type="button" onClick={() => setActiveStep(index)} aria-label={`Show ${title}`} aria-current={index === activeStep ? "step" : undefined} className={`h-2 w-2 rounded-full transition-colors ${index === activeStep ? "bg-primary" : "bg-border hover:bg-muted-foreground"}`} />)}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => move(-1)} aria-label="Previous process phase" className="grid h-11 w-11 place-items-center border border-border text-foreground transition-colors hover:border-primary hover:text-primary"><ArrowLeft size={18} aria-hidden="true" /></button>
              <button type="button" onClick={() => move(1)} aria-label="Next process phase" className="grid h-11 w-11 place-items-center border border-border text-foreground transition-colors hover:border-primary hover:text-primary"><ArrowRight size={18} aria-hidden="true" /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuoteForm() {
  const [formError, setFormError] = useState("");

  const requestQuote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const startDate = String(values.get("startDate") ?? "");
    const deadline = String(values.get("deadline") ?? "");
    if (!startDate || !deadline) {
      setFormError("Please add both a preferred start date and deadline.");
      return;
    }
    if (deadline < startDate) {
      setFormError("The deadline needs to fall after the preferred start date.");
      return;
    }
    setFormError("");
    const projectType = String(values.get("projectType") ?? "A new commission");
    const details = String(values.get("details") ?? "");
    const subject = encodeURIComponent(`Commission enquiry — ${projectType}`);
    const body = encodeURIComponent([
      `Hello ${artist.name},`,
      "",
      `I’d like to discuss: ${projectType}`,
      `Preferred start date: ${startDate}`,
      `Deadline: ${deadline}`,
      "",
      details,
    ].join("\n"));
    window.location.href = `mailto:${artist.email}?subject=${subject}&body=${body}`;
  };

  return (
    <section className="bg-muted/60 px-6 py-28 sm:px-10 sm:py-36">
      <div className="mx-auto grid max-w-7xl gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="font-mono text-xs uppercase text-primary">Start a commission</p>
          <h2 className="mt-6 font-serif text-4xl font-bold italic leading-tight sm:text-5xl">Tell me where we’re beginning—and when it needs to arrive.</h2>
          <p className="mt-8 max-w-md leading-relaxed text-muted-foreground">Your details open a prepared email, so you can review everything before sending it to me.</p>
        </div>
        <form onSubmit={requestQuote} className="rounded-[var(--ut-radius-base)] border border-border bg-card p-8 shadow-xl transition-shadow duration-300 hover:shadow-2xl sm:p-12 lg:col-span-6 lg:col-start-7" noValidate>
          <div className="grid gap-8 sm:grid-cols-2">
            <label className="font-mono text-xs uppercase text-muted-foreground">Preferred start date<input required name="startDate" type="date" className="mt-3 block w-full border-b border-border bg-transparent py-3 font-sans text-base text-foreground outline-none transition-colors focus:border-primary" /></label>
            <label className="font-mono text-xs uppercase text-muted-foreground">Deadline<input required name="deadline" type="date" className="mt-3 block w-full border-b border-border bg-transparent py-3 font-sans text-base text-foreground outline-none transition-colors focus:border-primary" /></label>
          </div>
          <label className="mt-8 block font-mono text-xs uppercase text-muted-foreground">What are we making?<input required name="projectType" placeholder="Picture book, character world, digital portfolio…" className="mt-3 block w-full border-b border-border bg-transparent py-3 font-sans text-base normal-case text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" /></label>
          <label className="mt-8 block font-mono text-xs uppercase text-muted-foreground">A few details<textarea name="details" rows={4} placeholder="Share the audience, scope, and the feeling the work should carry." className="mt-3 block w-full resize-none border-b border-border bg-transparent py-3 font-sans text-base normal-case text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" /></label>
          {formError ? <p role="alert" className="mt-5 text-sm text-primary">{formError}</p> : null}
          <button type="submit" className="mt-10 inline-flex items-center gap-4 border border-primary bg-primary px-7 py-4 font-mono text-xs uppercase text-primary-foreground transition-colors hover:bg-transparent hover:text-primary">Prepare quote request <ArrowUpRight size={18} aria-hidden="true" /></button>
        </form>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background text-foreground">
      <SiteNav />
      <main className="relative z-10">
        <section className="relative min-h-screen w-full overflow-hidden">
          <div className="absolute inset-0">
            <img src={artist.heroStudio} alt="Ariann Norori’s atmospheric creative studio" className="ut-kenburns h-full w-full object-cover" />
            <div className="aria-hero-veil absolute inset-0" />
          </div>
          <div className="aria-hero-foreground relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-end px-6 pb-20 pt-40 sm:px-10 sm:pb-28">
            <div className="flex items-center gap-5">
              <span className="h-px w-12 bg-background" />
              <p className="ut-rise font-mono text-xs uppercase opacity-80">Creative digital designer & artist</p>
            </div>
            <h1 className="ut-rise mt-8 font-serif text-8xl font-bold italic leading-none sm:text-9xl lg:text-[10rem]">ARIA</h1>
            <p className="mt-10 max-w-lg text-lg font-light leading-relaxed opacity-85 sm:text-xl">{artist.introduction}</p>
            <div className="mt-10 flex flex-wrap items-center gap-10">
              <Link to="/work" className="aria-hero-action border border-background px-8 py-4 font-mono text-xs uppercase transition-colors">Explore work</Link>
              <a href="#process" className="ut-link-caps opacity-80 transition-opacity hover:opacity-100">The process</a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-24 sm:px-10 sm:py-32">
          <div className="mb-14 flex items-end justify-between border-b border-border pb-5">
            <h2 className="font-serif text-4xl italic sm:text-6xl">Selected worlds</h2>
            <Link to="/work" className="ut-link-caps text-primary">View all work</Link>
          </div>
          <div className="grid grid-cols-1 items-start gap-x-8 gap-y-20 sm:grid-cols-12">
            {projects.map((project, index) => (
              <article key={project.slug} className={`${project.size === "wide" ? "sm:col-span-7" : "sm:col-span-5"} ${index === 1 ? "sm:mt-24" : ""} ${index === 3 ? "sm:-mt-20" : ""} group`}>
                <Link to="/process/$slug" params={{ slug: project.slug }}>
                  <div className={`${project.size === "portrait" ? "aspect-[4/5]" : project.size === "square" ? "aspect-square" : "aspect-[16/10]"} overflow-hidden bg-card`}>
                    <img src={project.image} alt={project.alt} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                  </div>
                  <div className="mt-5 flex items-baseline justify-between gap-4">
                    <h3 className="font-serif text-2xl italic sm:text-3xl">{project.title}</h3>
                    <span className="font-mono text-xs uppercase text-muted-foreground">{project.year}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{project.discipline}</p>
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section id="process" className="scroll-mt-24">
          <QuoteForm />
          <header className="mx-auto max-w-7xl px-6 pb-16 pt-16 sm:px-10 sm:pt-24">
            <p className="font-mono text-xs uppercase text-primary">Working together · Four chapters</p>
            <h2 className="mt-6 max-w-5xl font-serif text-4xl font-bold italic leading-tight sm:text-5xl lg:text-6xl">A process built around your story.</h2>
            <p className="mt-10 max-w-xl leading-relaxed text-muted-foreground sm:ml-auto">I keep each commission clear and collaborative, while leaving enough space for discovery and the unexpected idea that changes everything.</p>
          </header>
          <ProcessSlideshow />
          <section className="border-t border-border px-6 py-24 sm:px-10">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-end justify-between gap-8">
                <p className="font-mono text-xs uppercase text-primary">Process in practice</p>
                <Link to="/work" className="ut-link-caps text-primary">View all work</Link>
              </div>
              <div className="mt-10 grid gap-8 sm:grid-cols-2">
                {projects.slice(0, 2).map(project => (
                  <Link key={project.slug} to="/process/$slug" params={{ slug: project.slug }} className="group">
                    <img src={project.image} alt={project.alt} className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                    <h3 className="mt-4 font-serif text-3xl italic">{project.title}</h3>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </section>

      </main>
      <div className="relative z-10"><SiteFooter /></div>
    </div>
  );
}
