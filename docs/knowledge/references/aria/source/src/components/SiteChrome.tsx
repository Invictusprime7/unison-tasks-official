import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { AtmosphericBackground } from "@/components/AtmosphericBackground";

const navItems = [
  { label: "Work", to: "/work" as const },
  { label: "Contact", to: "/contact" as const },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-5">
      <nav
        aria-label="Primary navigation"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="flex max-w-full items-center gap-5 rounded-full border border-border bg-background/85 px-5 py-3 backdrop-blur-xl sm:gap-8"
      >
        <Link
          to="/"
          aria-expanded={open}
          aria-controls="aria-nav-links"
          className="shrink-0 font-serif text-lg italic text-foreground transition-opacity hover:opacity-70"
        >
          ARIA
        </Link>
        <div
          id="aria-nav-links"
          className={
            "flex items-center gap-5 overflow-hidden transition-all duration-300 ease-in-out sm:gap-7 " +
            (open
              ? "max-w-2xl opacity-100"
              : "pointer-events-none max-w-0 opacity-0")
          }
        >
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="shrink-0 font-mono text-xs uppercase text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-16 sm:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-serif text-5xl italic text-primary">Connect.</p>
          <a href="mailto:hello@ariannorori.com" className="mt-6 inline-block font-mono text-xs uppercase text-foreground underline underline-offset-8">
            hello@ariannorori.com
          </a>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-right">
          ARIA is my creative practice. I’m open for selected illustration, character, and digital art commissions.
        </p>
      </div>
    </footer>
  );
}

export function SitePage({ children, atmospheric = false }: { children: ReactNode; atmospheric?: boolean }) {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background font-sans text-foreground">
      {atmospheric ? <AtmosphericBackground /> : null}
      <SiteNav />
      <div className="relative z-10">
        {children}
        <SiteFooter />
      </div>
    </div>
  );
}

export function PageIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <header className="mx-auto max-w-7xl px-6 pb-20 pt-40 sm:px-10 sm:pb-28 sm:pt-48">
      <p className="font-mono text-xs uppercase text-primary">{eyebrow}</p>
      <h1 className="mt-6 max-w-4xl font-serif text-4xl font-bold italic leading-tight text-foreground sm:text-5xl lg:text-6xl">{title}</h1>
      <p className="mt-10 max-w-xl text-base leading-relaxed text-muted-foreground sm:ml-auto">{copy}</p>
    </header>
  );
}