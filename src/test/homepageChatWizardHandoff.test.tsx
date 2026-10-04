import { useState } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { AIAssistantCore } from '@/components/ai/AIAssistantCore';
import { SITE_CONFIRMATION_MARKER } from '@/components/ai/siteConfirmation';

vi.mock('@/hooks/useAIFileAnalysis', () => ({ useAIFileAnalysis: () => ({ analyzing: false, analyzeAndGenerate: vi.fn() }) }));
vi.mock('@/integrations/supabase/ai-client', () => ({ invokeAIFunction: vi.fn() }));
afterEach(cleanup);

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
