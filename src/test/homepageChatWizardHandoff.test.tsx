import { useState } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AIAssistantCore } from '@/components/ai/AIAssistantCore';
import { SITE_CONFIRMATION_MARKER } from '@/components/ai/siteConfirmation';
import { invokeAIFunction } from '@/integrations/supabase/ai-client';

vi.mock('@/hooks/useAIFileAnalysis', () => ({ useAIFileAnalysis: () => ({ analyzing: false, analyzeAndGenerate: vi.fn() }) }));
vi.mock('@/integrations/supabase/ai-client', () => ({ invokeAIFunction: vi.fn() }));
afterEach(cleanup);

it('reveals controls with each discovery question and sends selections back into the same chat', async () => {
  vi.mocked(invokeAIFunction)
    .mockResolvedValueOnce({ data: { mode: 'site-discovery', content: 'What is your main goal?', wizardStep: 'goals' }, error: null } as never)
    .mockResolvedValueOnce({ data: { mode: 'site-discovery', content: 'Which pages do you want?', wizardStep: 'pages' }, error: null } as never);
  render(<AIAssistantCore aiMode="site-discovery" showFileUpload={false}
    discoverySelections={(turn, answer) => <section aria-label="Question selections">
      <span>{turn.step}</span><button disabled={turn.pending} onClick={() => answer('My selection: Book appointments')}>Choose booking</button>
    </section>} />);
  expect(screen.queryByRole('region', { name: 'Question selections' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'I run a salon.' } });
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter' });
  expect(await screen.findByText('goals')).toBeInTheDocument();
  expect(screen.getByRole('textbox')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Choose booking' }));
  expect(await screen.findByText('pages')).toBeInTheDocument();
  expect(screen.getByText('I run a salon.')).toBeInTheDocument();
  expect(screen.getByText('My selection: Book appointments')).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  const calls = vi.mocked(invokeAIFunction).mock.calls;
  expect(calls[calls.length - 1]?.[1]).toMatchObject({
    messages: expect.arrayContaining([{ role: 'user', content: 'My selection: Book appointments' }]),
  });
});

it('keeps the discovery conversation when confirmation reveals inline selections', () => {
  function ChatHandoff() {
    const [brief, setBrief] = useState<string | null>(null);
    return <AIAssistantCore
      appearance="unison"
      showFileUpload={false}
      initialMessages={[
        { role: 'user', content: 'I need a salon website.', timestamp: new Date(0) },
        { role: 'assistant', content: `A salon website with booking. Does this look right? ${SITE_CONFIRMATION_MARKER}`, timestamp: new Date(0) },
      ]}
      onSiteConfirmed={setBrief}
      selectionActive={Boolean(brief)}
      conversationContent={brief ? <section aria-label="Inline selections">Choose your goals</section> : undefined}
    />;
  }
  render(<ChatHandoff />);
  fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Yes, please!' } });
  fireEvent.keyDown(screen.getByRole('textbox'), { key: 'Enter', shiftKey: false });
  expect(screen.getByRole('region', { name: 'Inline selections' })).toBeInTheDocument();
  expect(screen.getByText('I need a salon website.')).toBeInTheDocument();
  expect(screen.getByText('Yes, please!')).toBeInTheDocument();
  expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
