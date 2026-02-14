import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// ============================================
// Types
// ============================================

export interface SiteSEO {
  id?: string;
  projectId: string;
  businessId: string;
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string[];
  faviconUrl?: string;
  ogImageUrl?: string;
  canonicalBaseUrl?: string;
  twitterHandle?: string;
  facebookAppId?: string;
  robotsTxt: string;
  generateSitemap: boolean;
  jsonLdType: string;
  jsonLdData: Record<string, unknown>;
}

export interface PageSEO {
  id?: string;
  projectId: string;
  pageKey: string;
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImageUrl?: string;
  canonicalUrl?: string;
  noIndex: boolean;
  jsonLdType?: string;
  jsonLdData?: Record<string, unknown>;
}

interface UsePageSEOOptions {
  projectId: string;
  businessId: string;
  autoFetch?: boolean;
}

interface UsePageSEOReturn {
  siteSEO: SiteSEO | null;
  pageSEOMap: Record<string, PageSEO>;
  isLoading: boolean;
  isSaving: boolean;
  updateSiteSEO: (updates: Partial<SiteSEO>) => Promise<void>;
  updatePageSEO: (pageKey: string, updates: Partial<PageSEO>) => Promise<void>;
  deletePageSEO: (pageKey: string) => Promise<void>;
  getEffectiveSEO: (pageKey: string) => { title: string; description: string; ogTitle: string; ogDescription: string; ogImage?: string; keywords: string[]; canonical?: string; noIndex: boolean; jsonLd?: object };
  generateMetaTags: (pageKey: string) => string;
  injectSEOIntoHTML: (html: string, pageKey: string) => string;
  refresh: () => Promise<void>;
}

// ============================================
// Default
// ============================================

function createDefaultSiteSEO(projectId: string, businessId: string): SiteSEO {
  return {
    projectId,
    businessId,
    siteTitle: "",
    siteDescription: "",
    siteKeywords: [],
    robotsTxt: "User-agent: *\nAllow: /",
    generateSitemap: true,
    jsonLdType: "LocalBusiness",
    jsonLdData: {},
  };
}

// ============================================
// Hook
// ============================================

export function usePageSEO(options: UsePageSEOOptions): UsePageSEOReturn {
  const { projectId, businessId, autoFetch = true } = options;

  const [siteSEO, setSiteSEO] = useState<SiteSEO | null>(null);
  const [pageSEOMap, setPageSEOMap] = useState<Record<string, PageSEO>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load
  const load = useCallback(async () => {
    if (!projectId || !businessId) return;
    setIsLoading(true);
    try {
      // Fetch site SEO
      const { data: siteData } = await (supabase
        .from("project_seo") as any)
        .select("*")
        .eq("project_id", projectId)
        .maybeSingle();

      if (siteData) {
        setSiteSEO({
          id: siteData.id,
          projectId: siteData.project_id,
          businessId: siteData.business_id,
          siteTitle: siteData.site_title,
          siteDescription: siteData.site_description,
          siteKeywords: (siteData.site_keywords as string[]) || [],
          faviconUrl: siteData.favicon_url ?? undefined,
          ogImageUrl: siteData.og_image_url ?? undefined,
          canonicalBaseUrl: siteData.canonical_base_url ?? undefined,
          twitterHandle: siteData.twitter_handle ?? undefined,
          facebookAppId: siteData.facebook_app_id ?? undefined,
          robotsTxt: siteData.robots_txt || "User-agent: *\nAllow: /",
          generateSitemap: siteData.generate_sitemap ?? true,
          jsonLdType: siteData.json_ld_type || "LocalBusiness",
          jsonLdData: (siteData.json_ld_data as Record<string, unknown>) || {},
        });
      } else {
        setSiteSEO(createDefaultSiteSEO(projectId, businessId));
      }

      // Fetch page SEO
      const { data: pageData } = await (supabase
        .from("project_page_seo") as any)
        .select("*")
        .eq("project_id", projectId);

      if (pageData) {
        const map: Record<string, PageSEO> = {};
        for (const row of pageData) {
          map[row.page_key] = {
            id: row.id,
            projectId: row.project_id,
            pageKey: row.page_key,
            title: row.title ?? undefined,
            description: row.description ?? undefined,
            keywords: (row.keywords as string[]) ?? undefined,
            ogTitle: row.og_title ?? undefined,
            ogDescription: row.og_description ?? undefined,
            ogImageUrl: row.og_image_url ?? undefined,
            canonicalUrl: row.canonical_url ?? undefined,
            noIndex: row.no_index ?? false,
            jsonLdType: row.json_ld_type ?? undefined,
            jsonLdData: (row.json_ld_data as Record<string, unknown>) ?? undefined,
          };
        }
        setPageSEOMap(map);
      }
    } catch (err) {
      console.error("[usePageSEO] Load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, businessId]);

  // Update site SEO
  const updateSiteSEO = useCallback(async (updates: Partial<SiteSEO>) => {
    const current = siteSEO || createDefaultSiteSEO(projectId, businessId);
    const merged = { ...current, ...updates };
    setSiteSEO(merged);
    setIsSaving(true);

    try {
      const { error } = await (supabase
        .from("project_seo") as any)
        .upsert({
          project_id: projectId,
          business_id: businessId,
          site_title: merged.siteTitle,
          site_description: merged.siteDescription,
          site_keywords: merged.siteKeywords,
          favicon_url: merged.faviconUrl || null,
          og_image_url: merged.ogImageUrl || null,
          canonical_base_url: merged.canonicalBaseUrl || null,
          twitter_handle: merged.twitterHandle || null,
          facebook_app_id: merged.facebookAppId || null,
          robots_txt: merged.robotsTxt,
          generate_sitemap: merged.generateSitemap,
          json_ld_type: merged.jsonLdType,
          json_ld_data: merged.jsonLdData,
        }, { onConflict: "project_id" });

      if (error) throw error;
      toast.success("Site SEO saved");
    } catch (err) {
      console.error("[usePageSEO] Save site SEO error:", err);
      toast.error("Failed to save SEO settings");
    } finally {
      setIsSaving(false);
    }
  }, [siteSEO, projectId, businessId]);

  // Update page SEO
  const updatePageSEO = useCallback(async (pageKey: string, updates: Partial<PageSEO>) => {
    const current = pageSEOMap[pageKey] || { projectId, pageKey, noIndex: false };
    const merged = { ...current, ...updates };
    setPageSEOMap(prev => ({ ...prev, [pageKey]: merged }));
    setIsSaving(true);

    try {
      const { error } = await (supabase
        .from("project_page_seo") as any)
        .upsert({
          project_id: projectId,
          page_key: pageKey,
          title: merged.title || null,
          description: merged.description || null,
          keywords: merged.keywords || [],
          og_title: merged.ogTitle || null,
          og_description: merged.ogDescription || null,
          og_image_url: merged.ogImageUrl || null,
          canonical_url: merged.canonicalUrl || null,
          no_index: merged.noIndex,
          json_ld_type: merged.jsonLdType || null,
          json_ld_data: merged.jsonLdData || {},
        }, { onConflict: "project_id,page_key" });

      if (error) throw error;
    } catch (err) {
      console.error("[usePageSEO] Save page SEO error:", err);
      toast.error("Failed to save page SEO");
    } finally {
      setIsSaving(false);
    }
  }, [pageSEOMap, projectId]);

  // Delete page SEO
  const deletePageSEO = useCallback(async (pageKey: string) => {
    setPageSEOMap(prev => {
      const next = { ...prev };
      delete next[pageKey];
      return next;
    });

    try {
      await (supabase
        .from("project_page_seo") as any)
        .delete()
        .eq("project_id", projectId)
        .eq("page_key", pageKey);
    } catch (err) {
      console.error("[usePageSEO] Delete page SEO error:", err);
    }
  }, [projectId]);

  // Get effective SEO for a page (merges site + page overrides)
  const getEffectiveSEO = useCallback((pageKey: string) => {
    const site = siteSEO || createDefaultSiteSEO(projectId, businessId);
    const page = pageSEOMap[pageKey];

    const title = page?.title || site.siteTitle || "";
    const description = page?.description || site.siteDescription || "";

    return {
      title,
      description,
      ogTitle: page?.ogTitle || title,
      ogDescription: page?.ogDescription || description,
      ogImage: page?.ogImageUrl || site.ogImageUrl,
      keywords: page?.keywords?.length ? page.keywords : site.siteKeywords,
      canonical: page?.canonicalUrl || (site.canonicalBaseUrl ? `${site.canonicalBaseUrl}${pageKey === "home" ? "/" : `/${pageKey}`}` : undefined),
      noIndex: page?.noIndex ?? false,
      jsonLd: buildJsonLd(site, page, pageKey),
    };
  }, [siteSEO, pageSEOMap, projectId, businessId]);

  // Generate meta tags HTML string
  const generateMetaTags = useCallback((pageKey: string): string => {
    const seo = getEffectiveSEO(pageKey);
    const tags: string[] = [];

    if (seo.title) tags.push(`<title>${esc(seo.title)}</title>`);
    if (seo.description) tags.push(`<meta name="description" content="${esc(seo.description)}">`);
    if (seo.keywords.length) tags.push(`<meta name="keywords" content="${esc(seo.keywords.join(", "))}">`);
    if (seo.canonical) tags.push(`<link rel="canonical" href="${esc(seo.canonical)}">`);
    if (seo.noIndex) tags.push(`<meta name="robots" content="noindex, nofollow">`);

    // OG tags
    if (seo.ogTitle) tags.push(`<meta property="og:title" content="${esc(seo.ogTitle)}">`);
    if (seo.ogDescription) tags.push(`<meta property="og:description" content="${esc(seo.ogDescription)}">`);
    if (seo.ogImage) tags.push(`<meta property="og:image" content="${esc(seo.ogImage)}">`);
    tags.push(`<meta property="og:type" content="website">`);

    // Twitter
    tags.push(`<meta name="twitter:card" content="summary_large_image">`);
    if (siteSEO?.twitterHandle) tags.push(`<meta name="twitter:site" content="@${esc(siteSEO.twitterHandle)}">`);
    if (seo.ogTitle) tags.push(`<meta name="twitter:title" content="${esc(seo.ogTitle)}">`);
    if (seo.ogDescription) tags.push(`<meta name="twitter:description" content="${esc(seo.ogDescription)}">`);
    if (seo.ogImage) tags.push(`<meta name="twitter:image" content="${esc(seo.ogImage)}">`);

    // Favicon
    if (siteSEO?.faviconUrl) tags.push(`<link rel="icon" href="${esc(siteSEO.faviconUrl)}" type="image/x-icon">`);

    // JSON-LD
    if (seo.jsonLd) {
      tags.push(`<script type="application/ld+json">${JSON.stringify(seo.jsonLd)}</script>`);
    }

    return tags.join("\n  ");
  }, [getEffectiveSEO, siteSEO]);

  // Inject SEO into existing HTML template
  const injectSEOIntoHTML = useCallback((html: string, pageKey: string): string => {
    const metaTags = generateMetaTags(pageKey);
    if (!metaTags) return html;

    // Remove existing meta/title in <head>
    let result = html
      .replace(/<title>.*?<\/title>/gi, "")
      .replace(/<meta\s+name="description"[^>]*>/gi, "")
      .replace(/<meta\s+name="keywords"[^>]*>/gi, "")
      .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, "")
      .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, "")
      .replace(/<link\s+rel="canonical"[^>]*>/gi, "")
      .replace(/<meta\s+name="robots"[^>]*>/gi, "")
      .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, "");

    // Inject after <head> or after charset meta
    if (result.includes("</head>")) {
      result = result.replace("</head>", `  ${metaTags}\n</head>`);
    } else if (result.includes("<head>")) {
      result = result.replace("<head>", `<head>\n  ${metaTags}`);
    }

    return result;
  }, [generateMetaTags]);

  useEffect(() => {
    if (autoFetch && projectId && businessId) {
      load();
    }
  }, [autoFetch, projectId, businessId, load]);

  return {
    siteSEO,
    pageSEOMap,
    isLoading,
    isSaving,
    updateSiteSEO,
    updatePageSEO,
    deletePageSEO,
    getEffectiveSEO,
    generateMetaTags,
    injectSEOIntoHTML,
    refresh: load,
  };
}

// ============================================
// Helpers
// ============================================

function esc(str: string): string {
  return str.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildJsonLd(site: SiteSEO, page?: PageSEO, pageKey?: string): object | undefined {
  const type = page?.jsonLdType || site.jsonLdType;
  if (!type) return undefined;

  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": type,
    name: page?.title || site.siteTitle,
    description: page?.description || site.siteDescription,
    ...(site.jsonLdData || {}),
    ...(page?.jsonLdData || {}),
  };

  if (site.canonicalBaseUrl) {
    base.url = pageKey === "home" ? site.canonicalBaseUrl : `${site.canonicalBaseUrl}/${pageKey}`;
  }

  return base;
}
