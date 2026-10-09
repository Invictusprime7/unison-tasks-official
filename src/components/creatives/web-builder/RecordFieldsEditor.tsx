/**
 * Schema-driven record editor for the floating toolbar (Resource Runtime P0.14).
 * When the clicked element carries a `data-ut-resource` mark, show the record's
 * editable fields from its ResourceDefinition and save through ResourceRuntime
 * — the page file is never touched, so wording elsewhere and button
 * destinations stay as they are.
 */
import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Database, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getResource } from '@/services/resources/resourceRegistry';
import { applyResourceOp, getResourceRecord, parseResourceProvenance } from '@/services/resources/resourceRuntime';
import type { ResourceFieldDefinition, ResourceRecord } from '@/services/resources/resourceTypes';

const SKIP: ResourceFieldDefinition['type'][] = ['json'];

function toDraft(v: unknown): string {
  if (v == null) return '';
  return typeof v === 'object' ? JSON.stringify(v) : String(v);
}

function fromDraft(f: ResourceFieldDefinition, s: string): unknown {
  if (f.type === 'boolean') return s === 'true';
  if (['number', 'money', 'rating'].includes(f.type)) return s.trim() === '' ? null : Number(s);
  if (f.type === 'money-cents') return s.trim() === '' ? null : Math.round(Number(s));
  return s;
}

export function RecordFieldsEditor({ mark, businessId, projectId }: { mark?: string | null; businessId?: string | null; projectId?: string | null }) {
  const ref = useMemo(() => parseResourceProvenance(mark), [mark]);
  const recordId = ref?.recordId;
  // getResource builds a fresh definition per call; memo on the key so effects don't loop.
  const def = useMemo(() => (ref ? getResource(ref.resourceKey) : undefined), [ref?.resourceKey]);
  const fields = useMemo(() => {
    const all = (def?.schema ?? []).filter((f) => f.editable && !SKIP.includes(f.type));
    // Clicked field first so the most likely edit is on top.
    return ref?.field ? [...all.filter((f) => f.key === ref.field), ...all.filter((f) => f.key !== ref.field)] : all;
  }, [def, ref?.field]);
  const [record, setRecord] = useState<ResourceRecord | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setRecord(null); setDraft({});
    if (!open || !ref || !def || !businessId) return;
    let alive = true;
    setLoading(true);
    getResourceRecord(ref.resourceKey, { businessId, projectId, mode: 'builder' }, ref.recordId)
      .then((r) => {
        if (!alive) return;
        setRecord(r);
        setDraft(Object.fromEntries(fields.map((f) => [f.key, toDraft(r?.[f.key])])));
      })
      .catch((e) => alive && toast.error('Could not load this item', { description: e instanceof Error ? e.message : String(e) }))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, def, recordId, businessId, projectId]);

  if (!ref || !def || !businessId) return null;

  const changed = fields.filter((f) => draft[f.key] !== toDraft(record?.[f.key]));

  const save = async () => {
    if (!changed.length || saving) return;
    for (const f of changed) {
      if (f.required && !draft[f.key]?.trim()) { toast.error(`${f.label} can't be empty`); return; }
      if (['number', 'money', 'money-cents', 'rating'].includes(f.type) && draft[f.key].trim() && Number.isNaN(Number(draft[f.key]))) {
        toast.error(`${f.label} must be a number`); return;
      }
    }
    setSaving(true);
    try {
      const values = Object.fromEntries(changed.map((f) => [f.key, fromDraft(f, draft[f.key])]));
      const next = await applyResourceOp({ op: 'update', ref, values }, { businessId, projectId, mode: 'builder' });
      const previous = Object.fromEntries(changed.map((f) => [f.key, record?.[f.key] ?? null]));
      const applied = next ?? (record ? { ...record, ...values } : null);
      setRecord(applied);
      toast.success(`${def.label}: ${changed.map((f) => f.label).join(', ')} saved`, {
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              const back = await applyResourceOp({ op: 'update', ref, values: previous }, { businessId, projectId, mode: 'builder' });
              const restored = back ?? (applied ? { ...applied, ...previous } : null);
              setRecord(restored);
              setDraft(Object.fromEntries(fields.map((f) => [f.key, toDraft(restored?.[f.key])])));
              toast.success('Change undone');
            } catch (e) {
              toast.error('Could not undo', { description: e instanceof Error ? e.message : String(e) });
            }
          },
        },
      });
    } catch (e) {
      toast.error('Could not save', { description: e instanceof Error ? e.message : String(e) });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-1.5 border-b border-white/[0.06] px-1.5 pb-1.5">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-1.5 py-1 text-left text-[10px] text-white/70 hover:text-white">
        <Database className="h-3 w-3 text-cyan-400" />
        <span>Edit saved {def.label.toLowerCase()}</span>
        <span className="ml-auto text-white/40">{open ? 'Hide' : 'Show'}</span>
      </button>
      {open && (
        <div className="mt-1 flex max-h-64 flex-col gap-1.5 overflow-y-auto sleek-scrollbar">
          {loading ? (
            <div className="flex items-center gap-1.5 text-[10px] text-white/50"><Loader2 className="h-3 w-3 animate-spin" />Loading…</div>
          ) : !record ? (
            <div className="text-[10px] text-white/50">This item wasn't found in your saved records.</div>
          ) : (
            <>
              {fields.map((f) => (
                <label key={f.key} className="flex flex-col gap-0.5 text-[10px] text-white/60">
                  {f.label}
                  {f.type === 'boolean' ? (
                    <input type="checkbox" checked={draft[f.key] === 'true'} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: String(e.target.checked) }))} />
                  ) : f.type === 'textarea' || f.type === 'richtext' ? (
                    <Textarea rows={3} value={draft[f.key] ?? ''} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} className="text-xs" />
                  ) : (
                    <Input
                      type={['number', 'money', 'money-cents', 'rating'].includes(f.type) ? 'number' : f.type === 'email' ? 'email' : f.type === 'url' || f.type === 'image' ? 'url' : 'text'}
                      value={draft[f.key] ?? ''}
                      onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                      className="h-7 text-xs"
                    />
                  )}
                </label>
              ))}
              <Button size="sm" className="h-7 self-end text-xs" disabled={!changed.length || saving} onClick={save}>
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : `Save${changed.length ? ` (${changed.length})` : ''}`}
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
