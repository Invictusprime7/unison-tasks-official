import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Globe, Search, Image, Code2, ChevronRight, Save, Loader2, 
  Plus, X, FileText, Twitter, Share2, AlertTriangle, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SiteSEO, PageSEO } from "@/hooks/usePageSEO";

// ============================================
// Types
// ============================================

interface SEOSettingsPanelProps {
  siteSEO: SiteSEO | null;
  pageSEOMap: Record<string, PageSEO>;
  isSaving: boolean;
  activePageKey?: string;
  pageKeys: string[];
  onUpdateSiteSEO: (updates: Partial<SiteSEO>) => Promise<void>;
  onUpdatePageSEO: (pageKey: string, updates: Partial<PageSEO>) => Promise<void>;
  onPreviewMeta?: (pageKey: string) => void;
}

// ============================================
// Component
// ============================================

export function SEOSettingsPanel({
  siteSEO,
  pageSEOMap,
  isSaving,
  activePageKey = "home",
  pageKeys,
  onUpdateSiteSEO,
  onUpdatePageSEO,
  onPreviewMeta,
}: SEOSettingsPanelProps) {
  const [mode, setMode] = useState<"site" | "page">("site");
  const [selectedPage, setSelectedPage] = useState(activePageKey);
  const [openSections, setOpenSections] = useState<string[]>(["basic", "social"]);
  const [keywordInput, setKeywordInput] = useState("");

  // Local draft state for debounced saving
  const [siteDraft, setSiteDraft] = useState<Partial<SiteSEO>>({});
  const [pageDraft, setPageDraft] = useState<Partial<PageSEO>>({});

  useEffect(() => {
    setSelectedPage(activePageKey);
  }, [activePageKey]);

  useEffect(() => {
    setSiteDraft({});
  }, [siteSEO]);

  useEffect(() => {
    setPageDraft({});
  }, [selectedPage]);

  const toggleSection = (id: string) => {
    setOpenSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  // Merged values
  const siteValues = { ...(siteSEO || {}), ...siteDraft };
  const currentPageSEO = pageSEOMap[selectedPage];
  const pageValues = { ...(currentPageSEO || {}), ...pageDraft };

  // SEO score (simple heuristic)
  const seoScore = computeSEOScore(siteValues as SiteSEO, pageValues as PageSEO);

  const handleSaveSite = async () => {
    if (Object.keys(siteDraft).length > 0) {
      await onUpdateSiteSEO(siteDraft);
      setSiteDraft({});
    }
  };

  const handleSavePage = async () => {
    if (Object.keys(pageDraft).length > 0) {
      await onUpdatePageSEO(selectedPage, pageDraft);
      setPageDraft({});
    }
  };

  const addKeyword = (target: "site" | "page") => {
    const kw = keywordInput.trim();
    if (!kw) return;
    if (target === "site") {
      const current = (siteValues.siteKeywords as string[]) || [];
      if (!current.includes(kw)) {
        setSiteDraft(prev => ({ ...prev, siteKeywords: [...current, kw] }));
      }
    } else {
      const current = (pageValues.keywords as string[]) || [];
      if (!current.includes(kw)) {
        setPageDraft(prev => ({ ...prev, keywords: [...current, kw] }));
      }
    }
    setKeywordInput("");
  };

  const removeKeyword = (target: "site" | "page", kw: string) => {
    if (target === "site") {
      const current = (siteValues.siteKeywords as string[]) || [];
      setSiteDraft(prev => ({ ...prev, siteKeywords: current.filter(k => k !== kw) }));
    } else {
      const current = (pageValues.keywords as string[]) || [];
      setPageDraft(prev => ({ ...prev, keywords: current.filter(k => k !== kw) }));
    }
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-3 space-y-4">
        {/* Header with SEO score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">SEO Settings</span>
          </div>
          <SEOScoreBadge score={seoScore} />
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 p-0.5 bg-muted rounded-lg">
          <button
            onClick={() => setMode("site")}
            className={cn(
              "flex-1 text-xs py-1.5 rounded-md font-medium transition-colors",
              mode === "site"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Globe className="h-3 w-3 inline mr-1" />
            Site-wide
          </button>
          <button
            onClick={() => setMode("page")}
            className={cn(
              "flex-1 text-xs py-1.5 rounded-md font-medium transition-colors",
              mode === "page"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="h-3 w-3 inline mr-1" />
            Per Page
          </button>
        </div>

        {/* Page selector (page mode) */}
        {mode === "page" && (
          <Select value={selectedPage} onValueChange={setSelectedPage}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Select page" />
            </SelectTrigger>
            <SelectContent>
              {pageKeys.map(key => (
                <SelectItem key={key} value={key} className="text-xs">
                  {key === "home" ? "🏠 Home" : key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* === SITE-WIDE SEO === */}
        {mode === "site" && (
          <>
            {/* Basic Meta */}
            <SectionCollapsible
              id="basic"
              label="Basic Meta"
              icon={<Search className="h-3.5 w-3.5" />}
              open={openSections.includes("basic")}
              onToggle={() => toggleSection("basic")}
            >
              <div className="space-y-3">
                <Field label="Site Title" hint="Under 60 characters" charCount={(siteValues.siteTitle as string)?.length} charMax={60}>
                  <Input
                    value={(siteValues.siteTitle as string) || ""}
                    onChange={e => setSiteDraft(prev => ({ ...prev, siteTitle: e.target.value }))}
                    placeholder="My Business Name"
                    className="h-8 text-xs"
                  />
                </Field>
                <Field label="Description" hint="Under 160 characters" charCount={(siteValues.siteDescription as string)?.length} charMax={160}>
                  <Textarea
                    value={(siteValues.siteDescription as string) || ""}
                    onChange={e => setSiteDraft(prev => ({ ...prev, siteDescription: e.target.value }))}
                    placeholder="A brief description of your business..."
                    className="text-xs min-h-[60px] resize-none"
                  />
                </Field>
                <Field label="Keywords">
                  <div className="flex gap-1 mb-1.5">
                    <Input
                      value={keywordInput}
                      onChange={e => setKeywordInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addKeyword("site"))}
                      placeholder="Add keyword..."
                      className="h-7 text-xs flex-1"
                    />
                    <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => addKeyword("site")}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {((siteValues.siteKeywords as string[]) || []).map(kw => (
                      <Badge key={kw} variant="secondary" className="text-[10px] gap-1 py-0">
                        {kw}
                        <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => removeKeyword("site", kw)} />
                      </Badge>
                    ))}
                  </div>
                </Field>
                <Field label="Canonical Base URL">
                  <Input
                    value={(siteValues.canonicalBaseUrl as string) || ""}
                    onChange={e => setSiteDraft(prev => ({ ...prev, canonicalBaseUrl: e.target.value }))}
                    placeholder="https://mybusiness.com"
                    className="h-8 text-xs"
                  />
                </Field>
              </div>
            </SectionCollapsible>

            {/* Social / OG */}
            <SectionCollapsible
              id="social"
              label="Social & Open Graph"
              icon={<Share2 className="h-3.5 w-3.5" />}
              open={openSections.includes("social")}
              onToggle={() => toggleSection("social")}
            >
              <div className="space-y-3">
                <Field label="OG Image URL">
                  <Input
                    value={(siteValues.ogImageUrl as string) || ""}
                    onChange={e => setSiteDraft(prev => ({ ...prev, ogImageUrl: e.target.value }))}
                    placeholder="https://mybusiness.com/og.jpg"
                    className="h-8 text-xs"
                  />
                </Field>
                <Field label="Twitter Handle">
                  <Input
                    value={(siteValues.twitterHandle as string) || ""}
                    onChange={e => setSiteDraft(prev => ({ ...prev, twitterHandle: e.target.value }))}
                    placeholder="mybusiness"
                    className="h-8 text-xs"
                  />
                </Field>
                <Field label="Favicon URL">
                  <Input
                    value={(siteValues.faviconUrl as string) || ""}
                    onChange={e => setSiteDraft(prev => ({ ...prev, faviconUrl: e.target.value }))}
                    placeholder="https://mybusiness.com/favicon.ico"
                    className="h-8 text-xs"
                  />
                </Field>
              </div>
            </SectionCollapsible>

            {/* JSON-LD */}
            <SectionCollapsible
              id="jsonld"
              label="Structured Data (JSON-LD)"
              icon={<Code2 className="h-3.5 w-3.5" />}
              open={openSections.includes("jsonld")}
              onToggle={() => toggleSection("jsonld")}
            >
              <div className="space-y-3">
                <Field label="Schema Type">
                  <Select
                    value={(siteValues.jsonLdType as string) || "LocalBusiness"}
                    onValueChange={v => setSiteDraft(prev => ({ ...prev, jsonLdType: v }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LocalBusiness">Local Business</SelectItem>
                      <SelectItem value="Organization">Organization</SelectItem>
                      <SelectItem value="Restaurant">Restaurant</SelectItem>
                      <SelectItem value="Store">Store</SelectItem>
                      <SelectItem value="ProfessionalService">Professional Service</SelectItem>
                      <SelectItem value="HealthAndBeautyBusiness">Health & Beauty</SelectItem>
                      <SelectItem value="WebSite">Website</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Sitemap">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={(siteValues.generateSitemap as boolean) ?? true}
                      onCheckedChange={v => setSiteDraft(prev => ({ ...prev, generateSitemap: v }))}
                    />
                    <span className="text-xs text-muted-foreground">Auto-generate sitemap.xml</span>
                  </div>
                </Field>
              </div>
            </SectionCollapsible>

            {/* Save */}
            <Button
              onClick={handleSaveSite}
              disabled={isSaving || Object.keys(siteDraft).length === 0}
              className="w-full h-8 text-xs"
              size="sm"
            >
              {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
              Save Site SEO
            </Button>
          </>
        )}

        {/* === PER-PAGE SEO === */}
        {mode === "page" && (
          <>
            <SectionCollapsible
              id="page-basic"
              label="Page Meta"
              icon={<FileText className="h-3.5 w-3.5" />}
              open={openSections.includes("page-basic")}
              onToggle={() => toggleSection("page-basic")}
            >
              <div className="space-y-3">
                <Field label="Title" hint="Overrides site title" charCount={(pageValues.title as string)?.length} charMax={60}>
                  <Input
                    value={(pageValues.title as string) || ""}
                    onChange={e => setPageDraft(prev => ({ ...prev, title: e.target.value }))}
                    placeholder={`${selectedPage} | ${(siteValues.siteTitle as string) || "My Site"}`}
                    className="h-8 text-xs"
                  />
                </Field>
                <Field label="Description" charCount={(pageValues.description as string)?.length} charMax={160}>
                  <Textarea
                    value={(pageValues.description as string) || ""}
                    onChange={e => setPageDraft(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Page-specific description..."
                    className="text-xs min-h-[60px] resize-none"
                  />
                </Field>
                <Field label="Keywords">
                  <div className="flex gap-1 mb-1.5">
                    <Input
                      value={keywordInput}
                      onChange={e => setKeywordInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addKeyword("page"))}
                      placeholder="Add keyword..."
                      className="h-7 text-xs flex-1"
                    />
                    <Button size="sm" variant="outline" className="h-7 px-2" onClick={() => addKeyword("page")}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {((pageValues.keywords as string[]) || []).map(kw => (
                      <Badge key={kw} variant="secondary" className="text-[10px] gap-1 py-0">
                        {kw}
                        <X className="h-2.5 w-2.5 cursor-pointer" onClick={() => removeKeyword("page", kw)} />
                      </Badge>
                    ))}
                  </div>
                </Field>
              </div>
            </SectionCollapsible>

            <SectionCollapsible
              id="page-og"
              label="Open Graph Overrides"
              icon={<Image className="h-3.5 w-3.5" />}
              open={openSections.includes("page-og")}
              onToggle={() => toggleSection("page-og")}
            >
              <div className="space-y-3">
                <Field label="OG Title">
                  <Input
                    value={(pageValues.ogTitle as string) || ""}
                    onChange={e => setPageDraft(prev => ({ ...prev, ogTitle: e.target.value }))}
                    placeholder="Custom social share title..."
                    className="h-8 text-xs"
                  />
                </Field>
                <Field label="OG Description">
                  <Textarea
                    value={(pageValues.ogDescription as string) || ""}
                    onChange={e => setPageDraft(prev => ({ ...prev, ogDescription: e.target.value }))}
                    placeholder="Custom social share description..."
                    className="text-xs min-h-[50px] resize-none"
                  />
                </Field>
                <Field label="OG Image URL">
                  <Input
                    value={(pageValues.ogImageUrl as string) || ""}
                    onChange={e => setPageDraft(prev => ({ ...prev, ogImageUrl: e.target.value }))}
                    placeholder="https://..."
                    className="h-8 text-xs"
                  />
                </Field>
              </div>
            </SectionCollapsible>

            <SectionCollapsible
              id="page-advanced"
              label="Advanced"
              icon={<Code2 className="h-3.5 w-3.5" />}
              open={openSections.includes("page-advanced")}
              onToggle={() => toggleSection("page-advanced")}
            >
              <div className="space-y-3">
                <Field label="Canonical URL">
                  <Input
                    value={(pageValues.canonicalUrl as string) || ""}
                    onChange={e => setPageDraft(prev => ({ ...prev, canonicalUrl: e.target.value }))}
                    placeholder="https://mybusiness.com/page"
                    className="h-8 text-xs"
                  />
                </Field>
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">No-index this page</Label>
                  <Switch
                    checked={(pageValues.noIndex as boolean) ?? false}
                    onCheckedChange={v => setPageDraft(prev => ({ ...prev, noIndex: v }))}
                  />
                </div>
                <Field label="JSON-LD Type Override">
                  <Select
                    value={(pageValues.jsonLdType as string) || ""}
                    onValueChange={v => setPageDraft(prev => ({ ...prev, jsonLdType: v }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Inherit from site" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inherit">Inherit from site</SelectItem>
                      <SelectItem value="WebPage">WebPage</SelectItem>
                      <SelectItem value="AboutPage">About Page</SelectItem>
                      <SelectItem value="ContactPage">Contact Page</SelectItem>
                      <SelectItem value="FAQPage">FAQ Page</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                      <SelectItem value="ItemList">Item List</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </SectionCollapsible>

            <Button
              onClick={handleSavePage}
              disabled={isSaving || Object.keys(pageDraft).length === 0}
              className="w-full h-8 text-xs"
              size="sm"
            >
              {isSaving ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Save className="h-3 w-3 mr-1" />}
              Save Page SEO
            </Button>
          </>
        )}

        {/* SERP Preview */}
        <Separator />
        <SERPPreview
          title={mode === "page" ? (pageValues.title as string) || (siteValues.siteTitle as string) || "" : (siteValues.siteTitle as string) || ""}
          description={mode === "page" ? (pageValues.description as string) || (siteValues.siteDescription as string) || "" : (siteValues.siteDescription as string) || ""}
          url={(siteValues.canonicalBaseUrl as string) || "https://yoursite.com"}
        />
      </div>
    </ScrollArea>
  );
}

// ============================================
// Sub-components
// ============================================

function SectionCollapsible({ id, label, icon, open, onToggle, children }: {
  id: string; label: string; icon: React.ReactNode; open: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <Collapsible open={open} onOpenChange={onToggle}>
      <CollapsibleTrigger className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors">
        {icon}
        <span className="text-xs font-medium text-foreground flex-1 text-left">{label}</span>
        <ChevronRight className={cn("h-3 w-3 text-muted-foreground transition-transform", open && "rotate-90")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-2 pr-1 pb-2 space-y-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function Field({ label, hint, charCount, charMax, children }: {
  label: string; hint?: string; charCount?: number; charMax?: number; children: React.ReactNode;
}) {
  const overLimit = charMax && charCount ? charCount > charMax : false;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {charMax && (
          <span className={cn("text-[10px]", overLimit ? "text-destructive" : "text-muted-foreground/60")}>
            {charCount || 0}/{charMax}
          </span>
        )}
      </div>
      {children}
      {hint && <p className="text-[10px] text-muted-foreground/60">{hint}</p>}
    </div>
  );
}

function SEOScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "text-green-500" : score >= 50 ? "text-yellow-500" : "text-destructive";
  const Icon = score >= 80 ? CheckCircle2 : score >= 50 ? AlertTriangle : AlertTriangle;
  return (
    <div className={cn("flex items-center gap-1 text-xs font-medium", color)}>
      <Icon className="h-3.5 w-3.5" />
      {score}/100
    </div>
  );
}

function SERPPreview({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">SERP Preview</span>
      <div className="p-3 bg-background rounded-lg border border-border/50 space-y-0.5">
        <p className="text-xs text-muted-foreground truncate">{url || "https://yoursite.com"}</p>
        <p className="text-sm font-medium text-primary truncate leading-tight">
          {title || "Page Title"}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {description || "Add a meta description to see how your page will appear in search results."}
        </p>
      </div>
    </div>
  );
}

// ============================================
// SEO Score Calculator
// ============================================

function computeSEOScore(site: Partial<SiteSEO>, page: Partial<PageSEO>): number {
  let score = 0;
  const title = (page?.title || site?.siteTitle || "") as string;
  const desc = (page?.description || site?.siteDescription || "") as string;

  // Title (25 pts)
  if (title.length > 0) score += 10;
  if (title.length > 0 && title.length <= 60) score += 15;

  // Description (25 pts)
  if (desc.length > 0) score += 10;
  if (desc.length > 0 && desc.length <= 160) score += 15;

  // Keywords (10 pts)
  const kw = (page?.keywords as string[]) || (site?.siteKeywords as string[]) || [];
  if (kw.length > 0) score += 5;
  if (kw.length >= 3) score += 5;

  // OG Image (10 pts)
  if ((page?.ogImageUrl || site?.ogImageUrl)) score += 10;

  // Canonical (10 pts)
  if (site?.canonicalBaseUrl || page?.canonicalUrl) score += 10;

  // JSON-LD (10 pts)
  if (site?.jsonLdType) score += 10;

  // Favicon (5 pts)
  if (site?.faviconUrl) score += 5;

  return Math.min(score, 100);
}
