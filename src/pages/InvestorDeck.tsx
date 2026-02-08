import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DeckSection from "@/components/investor-deck/DeckSection";
import DeckCard from "@/components/investor-deck/DeckCard";
import DeckStats from "@/components/investor-deck/DeckStats";
import DeckArchDiagram from "@/components/investor-deck/DeckArchDiagram";
import DeckTable from "@/components/investor-deck/DeckTable";
import { openPrintWindow } from "@/components/investor-deck/DeckPrintHandler";
import {
  modules,
  intentRows,
  edgeFunctions,
  templateRows,
  recipePacks,
  agentFeatures,
  infraCards,
  dbCards,
  competitiveRows,
  techStackCards,
} from "@/components/investor-deck/deck-data";

const InvestorDeck = () => {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDownload = () => {
    openPrintWindow(contentRef.current?.innerHTML || "");
  };

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
        <div className="max-w-[900px] mx-auto px-10 py-12 font-sans text-foreground leading-relaxed">
          {/* Header */}
          <div className="text-center mb-14 pb-10 border-b-2 border-border">
            <div className="text-sm font-bold tracking-[4px] uppercase text-primary mb-6">
              UNISON TASKS
            </div>
            <h1 className="text-4xl font-black text-foreground mb-3 leading-tight">
              Platform Features &amp; System Infrastructure
            </h1>
            <p className="text-lg text-muted-foreground">
              The Operating System for Small Business
            </p>
            <p className="text-[13px] text-muted-foreground/60 mt-4">
              Confidential — {today}
            </p>
          </div>

          <DeckStats />

          {/* Executive Summary */}
          <DeckSection title="Executive Summary">
            <p className="text-[15px] text-foreground/80 mb-4">
              Unison Tasks is a vertically-integrated SaaS platform that transforms
              small businesses into digitally-automated operations. It combines a{" "}
              <strong>no-code website builder</strong>,{" "}
              <strong>CRM &amp; pipeline management</strong>,{" "}
              <strong>AI-powered automation engine</strong>, and{" "}
              <strong>multi-channel lead capture</strong> into a single operating
              system — eliminating the need for 5-7 separate software subscriptions.
            </p>
            <p className="text-[15px] text-foreground/80">
              The platform's core value loop:{" "}
              <em>
                a visitor fills a form on a business's site → the owner is
                immediately notified via email → the lead is captured in the CRM
                dashboard
              </em>
              . Every feature strengthens this cycle.
            </p>
          </DeckSection>

          {/* Core Modules */}
          <DeckSection title="Core Platform Modules">
            <div className="grid grid-cols-2 gap-5">
              {modules.map((m) => (
                <DeckCard key={m.badge} {...m} />
              ))}
            </div>
          </DeckSection>

          {/* Intent System */}
          <DeckSection
            title="Intent-Driven Architecture"
            desc="Every user interaction maps to a semantic intent, providing a universal event bus for the entire platform."
          >
            <DeckTable
              headers={["Intent", "Trigger", "Result"]}
              rows={intentRows}
            />
          </DeckSection>

          {/* Architecture */}
          <DeckSection title="System Architecture">
            <DeckArchDiagram />
          </DeckSection>

          {/* Edge Functions */}
          <DeckSection
            title="Backend Functions (40+)"
            desc="Serverless functions handling all business logic, AI orchestration, and integrations."
          >
            <div className="grid grid-cols-2 gap-5">
              {edgeFunctions.map((ef) => (
                <DeckCard key={ef.badge} {...ef} />
              ))}
            </div>
          </DeckSection>

          {/* Templates */}
          <DeckSection
            title="Industry Template Library"
            desc="24 premium templates across 8 verticals — each with dark, light, and bold variants."
          >
            <DeckTable
              headers={["Industry", "Dark Luxury", "Light Modern", "Bold Editorial"]}
              rows={templateRows}
            />
          </DeckSection>

          {/* Recipe Packs */}
          <DeckSection
            title="Automation Recipe Packs"
            desc="Pre-built workflow templates activated when a business launches a system."
          >
            <div className="grid grid-cols-2 gap-5">
              {recipePacks.map((rp) => (
                <DeckCard key={rp.badge} {...rp} />
              ))}
            </div>
          </DeckSection>

          {/* AI Agent System */}
          <DeckSection
            title="AI Agent Orchestration Layer"
            desc="Background AI that users sense through outcomes, not chatbot interfaces."
          >
            <ul className="list-none p-0">
              {agentFeatures.map((item) => (
                <li
                  key={item}
                  className="py-2.5 border-b border-border text-sm text-foreground/80 flex items-start gap-2.5 last:border-b-0"
                >
                  <span className="text-primary font-bold shrink-0">→</span>
                  {item}
                </li>
              ))}
            </ul>
          </DeckSection>

          {/* Infrastructure */}
          <DeckSection title="Infrastructure & DevOps">
            <div className="grid grid-cols-2 gap-5">
              {infraCards.map((c) => (
                <DeckCard key={c.badge} {...c} />
              ))}
            </div>
          </DeckSection>

          {/* Database */}
          <DeckSection
            title="Database Schema (30+ Tables)"
            desc="Core tables organized by domain, all with row-level security."
          >
            <div className="grid grid-cols-2 gap-5">
              {dbCards.map((c) => (
                <DeckCard key={c.badge} {...c} />
              ))}
            </div>
          </DeckSection>

          {/* Competitive Positioning */}
          <DeckSection title="Competitive Positioning">
            <DeckTable
              headers={["Capability", "Unison", "GoHighLevel", "Wix", "HubSpot"]}
              rows={competitiveRows}
              centerFrom={1}
            />
          </DeckSection>

          {/* Tech Stack */}
          <DeckSection title="Technology Stack">
            <div className="grid grid-cols-2 gap-5">
              {techStackCards.map((c) => (
                <DeckCard key={c.badge} {...c} />
              ))}
            </div>
          </DeckSection>

          {/* Footer */}
          <div className="text-center mt-14 pt-8 border-t-2 border-border text-muted-foreground text-[13px]">
            <p className="font-bold text-primary mb-1">UNISON TASKS</p>
            <p>Confidential — For Investor &amp; Endorser Review Only</p>
            <p className="mt-1">{today}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorDeck;
