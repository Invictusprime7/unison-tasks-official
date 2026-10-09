/**
 * Playground → Manage → Assets. One live view over the Resource Runtime:
 * Catalog, Content, Business and Media, filtered to what this site uses and
 * ranked by its industry. Reads/writes go through resourceRuntime only.
 */
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ChevronDown, ChevronRight, Circle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecordFieldsEditor } from "../RecordFieldsEditor";
import { listContentTypes } from "@/services/cmsRecordService";
import { registerContentTypes, BUSINESS_PROFILE_RESOURCE_KEY, type ContentTypeRow } from "@/services/resources/resourceRegistry";
import { applyResourceOp, onResourceInvalidated, queryResource } from "@/services/resources/resourceRuntime";
import type { ResourceRecord } from "@/services/resources/resourceTypes";
import {
  buildRenderedResourceIndex, isRelevantAsset, listAssetTypes, listSiteImages, type AssetType,
} from "@/services/resources/assetCatalog";

interface Props {
  businessId?: string | null;
  projectId?: string | null;
  industry?: string | null;
  vfsFiles?: Record<string, string>;
  formsSlot?: React.ReactNode;
  /** Show a record's real on-site instance (closes Playground, reveals in preview). */
  onReveal?: (mark: string, files: string[]) => void;
}

function recordTitle(r: ResourceRecord): string {
  return String(r.name ?? r.title ?? r.question ?? r.author_name ?? r.client_name ?? r.id);
}

function AssetList({ type, businessId, projectId, liveIndex, onReveal }: { type: AssetType; businessId: string; projectId?: string | null; liveIndex: Map<string, string[]>; onReveal?: Props['onReveal'] }) {
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
        <Button variant="ghost" size="sm" onClick={add}><Plus className="h-3.5 w-3.5" /> Add</Button>
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
                {type.def && type.def.kind !== "content" && (
                  <Button variant="ghost" size="icon" aria-label="Remove" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                )}
              </div>
              {open === r.id && <div className="pt-2"><RecordFieldsEditor mark={mark} businessId={businessId} projectId={projectId} /></div>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function AssetsSection({ businessId, projectId, industry, vfsFiles = {}, formsSlot, onReveal }: Props) {
  const [contentReady, setContentReady] = useState(0);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (!businessId) return;
    let alive = true;
    listContentTypes({ businessId, projectId: projectId ?? undefined } as never)
      .then((rows) => { if (!alive) return; registerContentTypes(rows as ContentTypeRow[]); setContentReady((n) => n + 1); })
      .catch(() => undefined);
    return () => { alive = false; };
  }, [businessId, projectId]);

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
        {relevant.map((t) => <AssetList key={t.key} type={t} businessId={businessId} projectId={projectId} liveIndex={liveIndex} onReveal={onReveal} />)}
        {group === "content" && formsSlot}
        {relevant.length === 0 && group === "catalog" && <p className="text-sm text-muted-foreground">This site doesn't sell or list items yet.</p>}
        {rest.length > 0 && (
          <div>
            <Button variant="ghost" size="sm" onClick={() => setShowMore((v) => !v)}>
              {showMore ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />} Add more types ({rest.length})
            </Button>
            {showMore && <div className="space-y-6 pt-3">{rest.map((t) => <AssetList key={t.key} type={t} businessId={businessId} projectId={projectId} liveIndex={liveIndex} onReveal={onReveal} />)}</div>}
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
