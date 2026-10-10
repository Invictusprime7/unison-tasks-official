/**
 * Playground → Manage → Assets. One live view over the Resource Runtime:
 * Catalog, Content, Business and Media, filtered to what this site uses and
 * ranked by its industry. Reads/writes go through resourceRuntime only.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ChevronDown, ChevronRight, Circle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecordFieldsEditor } from "../RecordFieldsEditor";
import { listContentTypes, transitionContentRecord } from "@/services/cmsRecordService";
import { supabase } from "@/integrations/supabase/client";
import { registerContentTypes, BUSINESS_PROFILE_RESOURCE_KEY, type ContentTypeRow } from "@/services/resources/resourceRegistry";
import { applyResourceOp, getResourceRecord, onResourceInvalidated, queryResource } from "@/services/resources/resourceRuntime";
import type { ResourceRecord } from "@/services/resources/resourceTypes";
import {
  buildRenderedResourceIndex, isRelevantAsset, listAssetTypes, listSiteImages, type AssetType,
} from "@/services/resources/assetCatalog";
import { adoptLongformFromSite, seedLaunchAssets } from "@/services/resources/seedLaunchAssets";
import { listCatalog } from "@/services/agent-runtime/catalogOps";
import type { CreatorData } from "@/types/creatorData";

interface Props {
  businessId?: string | null;
  projectId?: string | null;
  industry?: string | null;
  vfsFiles?: Record<string, string>;
  formsSlot?: React.ReactNode;
  /** Show a record's real on-site instance (closes Playground, reveals in preview). */
  onReveal?: (mark: string, files: string[]) => void;
  /** Ask the AI Builder to place a saved record onto a page (closes Playground, prefills the request). */
  onPlace?: (prompt: string) => void;
  /** Create real pages for saved articles/case studies and link their read buttons (canonical save). */
  onPublishLongform?: (items: { record: ResourceRecord; kind: "articles" | "case-studies"; resourceKey: string }[]) => Promise<void>;
  /** Saved launch data; used to backfill assets for sites generated before launch seeding existed. */
  creatorData?: CreatorData | null;
}

function recordTitle(r: ResourceRecord): string {
  return String(r.name ?? r.title ?? r.question ?? r.author_name ?? r.client_name ?? r.id);
}

/** Renders a record's real on-site appearance: the preview sends back the
 *  actual rendered markup plus the page's own CSS, shown in a sealed frame. */
function LiveSnippet({ mark, name }: { mark: string; name?: string }) {
  const [shot, setShot] = useState<{ html: string; css: string } | null | "missing">(null);
  useEffect(() => {
    setShot(null);
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; mark?: string; html?: string | null; css?: string | null };
      if (d?.type !== "RESOURCE_SNAPSHOT" || d.mark !== mark) return;
      setShot(d.html ? { html: d.html, css: d.css ?? "" } : "missing");
    };
    window.addEventListener("message", onMsg);
    const ask = () => document.querySelectorAll("iframe").forEach((f) => f.contentWindow?.postMessage({ type: "SNAPSHOT_RESOURCE", mark, name }, "*"));
    ask();
    const retry = setTimeout(ask, 800);
    return () => { window.removeEventListener("message", onMsg); clearTimeout(retry); };
  }, [mark, name]);
  if (shot === "missing") return null;
  if (!shot) return <p className="text-xs text-muted-foreground">Loading live look…</p>;
  return (
    <iframe
      title="Live appearance"
      sandbox=""
      className="pointer-events-none w-full border border-border"
      style={{ height: "12rem", background: "white" }}
      srcDoc={`<!doctype html><html><head><style>${shot.css}</style><style>body{margin:0}</style></head><body>${shot.html}</body></html>`}
    />
  );
}


interface ScannedItem { meta?: { date?: string | null; readTime?: string | null; author?: string | null } | null; kind: string; section: string; name: string; description: string; price: string | null; image: string | null; html: string }
const SCAN_GROUP: Record<string, "catalog" | "content"> = { products: "catalog", services: "catalog", testimonials: "content", articles: "content", faqs: "content", team: "content", gallery: "content" };
const SCAN_LABEL: Record<string, string> = { products: "Products & menu", services: "Services", testimonials: "Testimonials", articles: "Articles", faqs: "FAQs", team: "Team", gallery: "Gallery & portfolio" };

/** Read-only Live Preview scan: lists items actually rendered on the current
 *  page, whether or not they are saved. Saving goes through seedLaunchAssets. */
function SiteScanList({ group, businessId, onSaved }: { group: "catalog" | "content"; businessId: string; onSaved: () => void }) {
  const [scan, setScan] = useState<{ items: ScannedItem[]; css: string } | null>(null);
  const [open, setOpen] = useState<number | null>(-1);
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const requestId = `scan-${Date.now()}`;
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { type?: string; requestId?: string; items?: ScannedItem[]; css?: string };
      if (d?.type !== "ASSET_SCAN" || d.requestId !== requestId) return;
      setScan({ items: d.items ?? [], css: d.css ?? "" });
    };
    window.addEventListener("message", onMsg);
    const ask = () => document.querySelectorAll("iframe").forEach((f) => f.contentWindow?.postMessage({ type: "SCAN_ASSETS", requestId }, "*"));
    ask();
    const retry = setTimeout(ask, 900);
    return () => { window.removeEventListener("message", onMsg); clearTimeout(retry); };
  }, [tick]);
  const items = (scan?.items ?? []).map((it, i) => ({ it, i })).filter(({ it }) => SCAN_GROUP[it.kind] === group);
  const save = async (it: ScannedItem, i: number) => {
    const price = it.price ? Number(it.price.replace(/[^0-9.]/g, "")) || null : null;
    const one = { x: { name: it.name, description: it.description, price } };
    const data: Record<string, unknown> = {};
    if (it.kind === "products" || it.kind === "services") data[it.kind] = one;
    else if (it.kind === "testimonials") data.testimonials = { x: { author: it.name, content: it.description } };
    else if (it.kind === "articles") data.articles = { x: { title: it.name, excerpt: it.description, date: it.meta?.date ?? undefined, readTime: it.meta?.readTime ?? undefined, author: it.meta?.author ?? undefined, image: it.image ?? undefined } };
    else if (it.kind === "faqs") data.faqs = { x: { question: it.name, answer: it.description } };
    else if (it.kind === "team") data.team = { x: { name: it.name, bio: it.description } };
    else data.gallery = { x: { caption: it.name } };
    try {
      await seedLaunchAssets({ businessId, creatorData: data as unknown as CreatorData });
      setSaved((s) => new Set(s).add(i));
      onSaved();
      toast.success(`Saved "${it.name}"`);
    } catch { toast.error("Couldn't save this item"); }
  };
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Found on this page</h3>
        <Button variant="ghost" size="sm" onClick={() => setTick((n) => n + 1)}>Rescan</Button>
      </div>
      {!scan && <p className="text-xs text-muted-foreground">Scanning the live preview…</p>}
      {scan && items.length === 0 && <p className="text-xs text-muted-foreground">Nothing of this kind is showing on the current page.</p>}
      <ul className="divide-y divide-border">
        {items.map(({ it, i }) => (
          <li key={i} className="py-2">
            <div className="flex items-center gap-2">
              <button type="button" className="flex flex-1 items-center gap-2 text-left text-sm text-foreground" onClick={() => setOpen(open === i ? null : i)}>
                {open === i ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                <span className="truncate">{it.name}</span>
                <Badge variant="outline">{SCAN_LABEL[it.kind]}</Badge>
              </button>
              {saved.has(i) ? <Badge variant="secondary">Saved</Badge> : <Button variant="ghost" size="sm" onClick={() => save(it, i)}>Save to assets</Button>}
            </div>
            {(open === -1 || open === i) && (
              <iframe
                title="Live appearance"
                sandbox=""
                className="pointer-events-none mt-2 w-full border border-border"
                style={{ height: "12rem", background: "white" }}
                srcDoc={`<!doctype html><html><head><style>${scan?.css ?? ""}</style><style>body{margin:0}</style></head><body>${it.html}</body></html>`}
              />
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

const LONGFORM = /^content:(articles|case-studies)$/;

/** Article / case-study actions: AI-drafted full text (saved as Draft) and a
 *  per-item page with linked "Read" buttons via the AI Builder save flow. */
function LongformActions({ type, record, businessId, projectId, onPublish }: { type: AssetType; record: ResourceRecord; businessId: string; projectId?: string | null; onPublish?: Props['onPublishLongform'] }) {
  const [busy, setBusy] = useState(false);
  const isArticle = type.key === "content:articles";
  const title = recordTitle(record);
  const slug = String(record.slug ?? "") || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const write = async () => {
    setBusy(true);
    try {
      const rec = (await getResourceRecord(type.key, { businessId, projectId, mode: "builder" }, record.id).catch(() => null)) ?? record;
      const brief = [`Title: ${title}`, rec.category && `Category: ${record.category}`, record.client && `Client: ${record.client}`, record.excerpt && `Summary: ${record.excerpt}`, record.results && `Results: ${record.results}`].filter(Boolean).join("\n");
      const { data, error } = await supabase.functions.invoke("copy-rewrite", { body: { text: brief, purpose: "article", tone: "authoritative" } });
      if (error || !data?.rewrittenText) throw new Error(data?.error || error?.message || "No text came back");
      await applyResourceOp({ op: "update", ref: { resourceKey: type.key, kind: "content", recordId: record.id }, values: { body: data.rewrittenText, slug } }, { businessId, projectId, mode: "builder" });
      if (record.status !== "draft") await transitionContentRecord({ businessId, projectId, recordId: record.id, status: "draft", changeSummary: "AI wrote full text" }).catch(() => undefined);
      toast.success("Full text written and saved as Draft", { description: "Review it below, then publish." });
    } catch (e) {
      toast.error("Couldn't write the article", { description: e instanceof Error ? e.message : String(e) });
    } finally { setBusy(false); }
  };
  const page = async () => {
    if (!onPublish) return;
    setBusy(true);
    try {
      // List rows omit saved fields (slug, text); load the full item first.
      const full = (await getResourceRecord(type.key, { businessId, projectId, mode: "builder" }, record.id).catch(() => null)) ?? record;
      const fullSlug = String(full.slug ?? "") || slug;
      await onPublish([{ record: { ...full, slug: fullSlug }, kind: isArticle ? "articles" : "case-studies", resourceKey: type.key }]); }
    finally { setBusy(false); }
  };
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" disabled={busy} onClick={write}>{busy ? "Writing…" : record.body ? "Rewrite full text" : "Write full text"}</Button>
      {onPublish && <Button variant="outline" size="sm" disabled={busy} onClick={page}>Create page &amp; link button</Button>}
    </div>
  );
}

function AssetList({ type, businessId, projectId, liveIndex, onReveal, onPlace, onPublishLongform }: { type: AssetType; businessId: string; projectId?: string | null; liveIndex: Map<string, string[]>; onReveal?: Props['onReveal']; onPlace?: Props['onPlace']; onPublishLongform?: Props['onPublishLongform'] }) {
  const [rows, setRows] = useState<ResourceRecord[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const ctx = useMemo(() => ({ businessId, projectId, mode: "builder" as const }), [businessId, projectId]);

  useEffect(() => {
    let alive = true;
    queryResource(type.key, ctx).then((r) => alive && setRows(r)).catch(() => alive && setRows([]));
    return () => { alive = false; };
  }, [type.key, ctx, tick]);
  useEffect(() => onResourceInvalidated((i) => { if (i.resourceKey === type.key) setTick((t) => t + 1); }), [type.key]);

  const add = async () => {
    const first = type.def?.schema.find((f) => f.required) ?? type.def?.schema[0];
    try {
      await applyResourceOp({ op: "create", resourceKey: type.key, values: first ? { [first.key]: `New ${type.label}` } : {} }, ctx);
    } catch (e) { toast.error(`Couldn't add to ${type.label}`, { description: e instanceof Error ? e.message : String(e) }); }
  };
  const remove = async (id: string) => {
    try {
      await applyResourceOp({ op: "delete", ref: { resourceKey: type.key, kind: type.def!.kind, recordId: id } }, ctx);
    } catch (e) { toast.error("Couldn't remove", { description: e instanceof Error ? e.message : String(e) }); }
  };

  return (
    <section className="space-y-2">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-foreground">{type.used ? `Live ${type.label}` : type.label}</h4>
          {type.used && <Badge variant="secondary">On site</Badge>}
          {rows && <span className="text-xs text-muted-foreground">{rows.length}</span>}
        </div>
        <div className="flex items-center gap-1">
          {LONGFORM.test(type.key) && onPublishLongform && rows && rows.length > 0 && (
            <Button variant="ghost" size="sm" onClick={async () => {
              // List rows omit saved fields (slug, text); load each full item first.
              const full = await Promise.all(rows.map((r) => getResourceRecord(type.key, ctx, r.id).catch(() => null).then((f) => f ?? r)));
              await onPublishLongform(full.map((record) => ({ record, kind: type.key === "content:articles" ? "articles" : "case-studies", resourceKey: type.key })));
            }}>
              Create all pages
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={add}><Plus className="h-3.5 w-3.5" /> Add</Button>
        </div>
      </header>
      {rows === null && <p className="text-xs text-muted-foreground">Loading…</p>}
      {rows?.length === 0 && <p className="text-xs text-muted-foreground">Nothing saved yet.</p>}
      <ul className="divide-y divide-border border-y border-border">
        {rows?.map((r) => {
          const mark = `${type.key}#${r.id}`;
          const live = liveIndex.has(mark);
          return (
            <li key={r.id} className="py-2">
              <div className="flex items-center gap-2">
                <button type="button" className="flex flex-1 items-center gap-2 text-left text-sm text-foreground" onClick={() => setOpen(open === r.id ? null : r.id)}>
                  {open === r.id ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  <span className="truncate">{recordTitle(r)}</span>
                  {live && <Circle className="h-2 w-2 fill-primary text-primary" aria-label="Shown on site" />}
                  {typeof r.status === "string" && <Badge variant="outline">{r.status}</Badge>}
                </button>
                {live && onReveal && (
                  <Button variant="ghost" size="icon" aria-label="Show on site" onClick={() => onReveal(mark, liveIndex.get(mark) ?? [])}><Eye className="h-3.5 w-3.5" /></Button>
                )}
                {!live && onPlace && (
                  <Button variant="ghost" size="sm" aria-label="Place on page" onClick={() => onPlace(
                    `Add the saved ${type.label.toLowerCase()} "${recordTitle(r)}" (resource ${mark}) to the most relevant page of the site, rendering it with its saved fields. Keep all existing content and button destinations unchanged.`,
                  )}>Place on page</Button>
                )}
                {type.def && type.def.kind !== "content" && (
                  <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                )}
              </div>
              {open === r.id && (
                <div className="space-y-2 pt-2">
                  <LiveSnippet mark={mark} name={live ? undefined : recordTitle(r)} />
                  {LONGFORM.test(type.key) && <LongformActions type={type} record={r} businessId={businessId} projectId={projectId} onPublish={onPublishLongform} />}
                  <RecordFieldsEditor mark={mark} businessId={businessId} projectId={projectId} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function AssetsSection({ businessId, projectId, industry, vfsFiles = {}, formsSlot, onReveal, onPlace, onPublishLongform, creatorData }: Props) {
  const [contentReady, setContentReady] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const backfillTried = useRef<string | null>(null);

  useEffect(() => {
    if (!businessId) return;
    let alive = true;
    listContentTypes({ businessId, projectId: projectId ?? undefined } as never)
      .then((rows) => { if (!alive) return; registerContentTypes(rows as ContentTypeRow[]); setContentReady((n) => n + 1); })
      .catch(() => undefined);
    return () => { alive = false; };
  }, [businessId, projectId]);

  // Backfill: sites generated before launch seeding existed have planned
  // assets in their saved playground data but nothing in the catalog. Seed
  // once per business, only when the catalog is still completely empty, so
  // deliberately deleted items are never resurrected.
  useEffect(() => {
    if (!businessId || !creatorData || backfillTried.current === businessId) return;
    const hasPlanned =
      Object.keys(creatorData.products ?? {}).length > 0 ||
      Object.keys(creatorData.services ?? {}).length > 0 ||
      Object.keys(creatorData.testimonials ?? {}).length > 0 ||
      Object.keys(creatorData.faqs ?? {}).length > 0 ||
      Object.keys(creatorData.team ?? {}).length > 0;
    if (!hasPlanned) return;
    backfillTried.current = businessId;
    let alive = true;
    listCatalog(businessId, ["products", "services", "testimonials"])
      .then(async (rows) => {
        if (!alive || rows.length > 0) return;
        await seedLaunchAssets({ businessId, creatorData });
        if (alive) setContentReady((n) => n + 1);
      })
      .catch(() => undefined);
    return () => { alive = false; };
  }, [businessId, creatorData]);

  // Adopt articles / case studies the site already shows (once per business per session).
  const longformTried = useRef<string | null>(null);
  useEffect(() => {
    if (!businessId || longformTried.current === businessId || !Object.keys(vfsFiles).length) return;
    longformTried.current = businessId;
    let alive = true;
    adoptLongformFromSite({ businessId, vfsFiles })
      .then(() => listContentTypes({ businessId, projectId: projectId ?? undefined } as never))
      .then((rows) => { if (!alive) return; registerContentTypes(rows as ContentTypeRow[]); setContentReady((n) => n + 1); })
      .catch(() => undefined);
    return () => { alive = false; };
  }, [businessId, projectId, vfsFiles]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const types = useMemo(() => listAssetTypes({ industry, vfsFiles }), [industry, vfsFiles, contentReady]);
  const liveIndex = useMemo(() => buildRenderedResourceIndex(vfsFiles), [vfsFiles]);
  const images = useMemo(() => listSiteImages(vfsFiles), [vfsFiles]);

  if (!businessId) return <p className="text-sm text-muted-foreground">Save the site to a business to manage its assets.</p>;

  const renderGroup = (group: "catalog" | "content") => {
    const all = types.filter((t) => t.group === group);
    const relevant = all.filter(isRelevantAsset);
    const rest = all.filter((t) => !isRelevantAsset(t));
    return (
      <div className="space-y-6">
        <SiteScanList group={group} businessId={businessId} onSaved={() => setContentReady((n) => n + 1)} />
        {relevant.map((t) => <AssetList key={t.key} type={t} businessId={businessId} projectId={projectId} liveIndex={liveIndex} onReveal={onReveal} onPlace={onPlace} onPublishLongform={onPublishLongform} />)}
        {group === "content" && formsSlot}
        {relevant.length === 0 && group === "catalog" && <p className="text-sm text-muted-foreground">This site doesn't sell or list items yet.</p>}
        {rest.length > 0 && (
          <div>
            <Button variant="ghost" size="sm" onClick={() => setShowMore((v) => !v)}>
              {showMore ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />} Add more types ({rest.length})
            </Button>
            {showMore && <div className="space-y-6 pt-3">{rest.map((t) => <AssetList key={t.key} type={t} businessId={businessId} projectId={projectId} liveIndex={liveIndex} onReveal={onReveal} onPlace={onPlace} onPublishLongform={onPublishLongform} />)}</div>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold text-foreground">Assets</h3>
        <p className="text-xs text-muted-foreground">Everything this site shows, saved for this business. Edits update the live preview.</p>
      </div>
      <Tabs defaultValue="catalog">
        <TabsList>
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>
        <TabsContent value="catalog" className="pt-4">{renderGroup("catalog")}</TabsContent>
        <TabsContent value="content" className="pt-4">{renderGroup("content")}</TabsContent>
        <TabsContent value="business" className="pt-4">
          <RecordFieldsEditor mark={`${BUSINESS_PROFILE_RESOURCE_KEY}#${businessId}`} businessId={businessId} projectId={projectId} />
        </TabsContent>
        <TabsContent value="media" className="pt-4">
          {images.length === 0 ? <p className="text-sm text-muted-foreground">No images on the site yet.</p> : (
            <ul className="grid grid-cols-3 gap-3">
              {images.map((img) => (
                <li key={img.url} className="space-y-1">
                  <img src={img.url} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                  <p className="truncate text-xs text-muted-foreground">{img.files.map((f) => f.split("/").pop()).join(", ")}</p>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
