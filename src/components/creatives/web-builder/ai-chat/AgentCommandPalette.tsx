import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import { agentOperations } from '@/services/agent-runtime/operations';
import { buildSystemGraph } from '@/services/agent-runtime/systemGraph';
import { emitAgentEvent } from '@/services/agent-runtime/agentEvents';
import { applyAIBuilderFiles, type AIBuilderApplyCallback } from '@/services/aiBuilderApply';

const FONTS = ['Inter', 'Playfair Display', 'DM Sans', 'Cormorant Garamond', 'Space Grotesk'];

interface Props {
  files: Record<string, string>;
  onApply: AIBuilderApplyCallback;
  onAsk: (prompt: string) => void;
}

type Mode = 'root' | 'font' | 'map';

/**
 * Ctrl/Cmd+K. Every action calls the same agent-runtime operations and the
 * same save path the AI uses — the menu has no capabilities of its own.
 */
export function AgentCommandPalette({ files, onApply, onAsk }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('root');
  const [query, setQuery] = useState('');
  const graph = useMemo(() => (open ? buildSystemGraph(files) : null), [open, files]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { if (!open) { setMode('root'); setQuery(''); } }, [open]);

  const run = async (change: { files: Record<string, string>; summary: string } | null) => {
    setOpen(false);
    if (!change) { toast.error('That change could not be prepared for this site.'); return; }
    emitAgentEvent({ kind: 'tool_call', message: change.summary, status: 'running' });
    const outcome = await applyAIBuilderFiles(onApply, change.files, { summary: change.summary, origin: 'command-menu' });
    if (outcome.success) toast.success(change.summary);
    else toast.error(outcome.errors?.[0] ?? 'The change was not saved.');
  };

  const ask = (prompt: string) => { setOpen(false); onAsk(prompt); };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder={mode === 'font' ? 'Choose a font…' : mode === 'map' ? 'Search pages and buttons…' : 'Type a command or ask Unison…'}
        value={query}
        onValueChange={setQuery}
        aria-label="Command"
      />
      <CommandList>
        <CommandEmpty>
          {mode === 'root' && query.trim()
            ? <button type="button" className="underline" onClick={() => ask(query)}>Ask Unison: “{query}”</button>
            : 'No matches.'}
        </CommandEmpty>
        {mode === 'root' && (
          <>
            <CommandGroup heading="Design">
              <CommandItem onSelect={() => setMode('font')}>Change body font…</CommandItem>
              <CommandItem onSelect={() => ask('Change the colour theme to ')}>Change colour theme…</CommandItem>
              <CommandItem onSelect={() => ask('Swap the main image on this page for ')}>Swap an image…</CommandItem>
            </CommandGroup>
            <CommandGroup heading="Site">
              <CommandItem onSelect={() => setMode('map')}>Show site map and button destinations</CommandItem>
              <CommandItem onSelect={() => ask('Add a new page called ')}>Add a page…</CommandItem>
              <CommandItem onSelect={() => ask('Find and repair the current preview error')}>Repair current error</CommandItem>
            </CommandGroup>
            {query.trim() && (
              <CommandGroup heading="Ask">
                <CommandItem value={`ask ${query}`} onSelect={() => ask(query)}>Ask Unison: “{query}”</CommandItem>
              </CommandGroup>
            )}
          </>
        )}
        {mode === 'font' && (
          <CommandGroup heading="Fonts">
            {FONTS.map((f) => (
              <CommandItem key={f} onSelect={() => run(agentOperations.set_font({ files }, f))}>{f}</CommandItem>
            ))}
          </CommandGroup>
        )}
        {mode === 'map' && graph?.pages.map((p) => (
          <CommandGroup key={p.path} heading={`${p.name} · ${p.sections.length} sections`}>
            {p.intents.length === 0 && (
              <CommandItem value={`${p.name} no buttons`} onSelect={() => ask(`On the ${p.name} page, `)}>No wired buttons — edit this page…</CommandItem>
            )}
            {p.intents.map((i, idx) => (
              <CommandItem
                key={`${p.path}-${idx}`}
                value={`${p.name} ${i.label} ${i.intent} ${i.target ?? ''}`}
                onSelect={() => ask(`On the ${p.name} page, the "${i.label || i.intent}" button: `)}
              >
                <span className="truncate">“{i.label || i.intent}” → {i.target ?? i.intent}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
