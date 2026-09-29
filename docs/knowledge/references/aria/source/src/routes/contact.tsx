import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import type { FormEvent } from "react";
import { SitePage } from "@/components/SiteChrome";
import { artist } from "@/lib/portfolio-data";

export const Route = createFileRoute("/contact")({ head: () => ({ meta: [
  { title: "Contact — ARIA by Ariann Norori" }, { name: "description", content: "Commission Ariann Norori for children’s illustration, character design, or a custom digital art project." },
  { property: "og:title", content: "Commission ARIA" }, { property: "og:description", content: "Start an illustration, character, or custom digital art commission with Ariann Norori." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
] }), component: ContactPage });

function ContactPage() {
  const prepareEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const name = String(values.get("name") ?? "");
    const email = String(values.get("email") ?? "");
    const inquiry = String(values.get("inquiry") ?? "Commission enquiry");
    const message = String(values.get("message") ?? "");
    const subject = encodeURIComponent(`${inquiry} — ${name}`);
    const body = encodeURIComponent([`Hello ${artist.name},`, "", message, "", `From: ${name}`, `Reply to: ${email}`].join("\n"));
    window.location.href = `mailto:${artist.email}?subject=${subject}&body=${body}`;
  };

  return <SitePage><main className="mx-auto grid max-w-7xl gap-16 px-6 pb-32 pt-40 sm:px-10 sm:pt-48 lg:grid-cols-12 lg:gap-24">
    <section className="lg:col-span-5">
      <p className="font-mono text-xs uppercase text-primary">Selected commissions open</p>
      <h1 className="mt-6 font-serif text-4xl font-bold italic leading-tight sm:text-5xl lg:text-6xl">Connect<br />with ARIA.</h1>
      <p className="mt-10 max-w-md text-lg leading-relaxed text-muted-foreground">I welcome inquiries for children’s publishing, original character worlds, cultural commissions, and custom digital art.</p>
      <div className="mt-16 border-t border-border pt-8">
        <p className="font-mono text-xs uppercase text-primary">Direct inquiries</p>
        <a href={`mailto:${artist.email}`} className="mt-4 block break-words text-lg text-foreground underline decoration-primary underline-offset-8">{artist.email}</a>
      </div>
    </section>

    <form onSubmit={prepareEmail} className="border border-border bg-secondary/40 p-8 sm:p-12 lg:col-span-7" aria-label="Commission inquiry">
      <div className="grid gap-10 sm:grid-cols-2">
        <label className="font-mono text-xs uppercase text-muted-foreground">Your name<input required name="name" autoComplete="name" className="mt-3 block w-full border-b border-border bg-transparent py-3 font-sans text-base normal-case text-foreground outline-none transition-colors focus:border-primary" /></label>
        <label className="font-mono text-xs uppercase text-muted-foreground">Email address<input required name="email" type="email" autoComplete="email" className="mt-3 block w-full border-b border-border bg-transparent py-3 font-sans text-base normal-case text-foreground outline-none transition-colors focus:border-primary" /></label>
      </div>
      <label className="mt-10 block font-mono text-xs uppercase text-muted-foreground">Inquiry type<select name="inquiry" className="mt-3 block w-full border-b border-border bg-transparent py-3 font-sans text-base normal-case text-foreground outline-none transition-colors focus:border-primary"><option>Illustration commission</option><option>Character design</option><option>Custom digital art</option><option>Creative collaboration</option></select></label>
      <label className="mt-10 block font-mono text-xs uppercase text-muted-foreground">Tell me about the project<textarea required name="message" rows={5} placeholder="Audience, scope, timing, and what you hope people will feel…" className="mt-3 block w-full resize-none border-b border-border bg-transparent py-3 font-sans text-base normal-case text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" /></label>
      <button type="submit" className="mt-10 inline-flex w-full items-center justify-center gap-4 border border-primary bg-primary px-7 py-4 font-mono text-xs uppercase text-primary-foreground transition-colors hover:bg-transparent hover:text-primary">Prepare email <ArrowUpRight size={18} aria-hidden="true" /></button>
      <p className="mt-5 text-sm leading-relaxed text-muted-foreground">This opens your email app so you can review everything before sending.</p>
    </form>
  </main></SitePage>;
}