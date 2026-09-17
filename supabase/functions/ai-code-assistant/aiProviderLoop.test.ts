import {
  buildPlannedChatCompletionRequest,
  PROVIDER_LOOP_TOTAL_BUDGET_MS,
  runProviderLoop,
} from './aiProviderLoop.ts';

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const messages = [{ role: 'user', content: 'Generate the requested site.' }];

Deno.test('keeps server headroom beyond the funded Wizard lead attempt', () => {
  assert(PROVIDER_LOOP_TOTAL_BUDGET_MS === 135_000, 'provider loop should allow 135 seconds');
});

Deno.test('omits reasoning_effort for the GPT-4.1 Wizard fallback', () => {
  const request = buildPlannedChatCompletionRequest({
    model: { id: 'openai/gpt-4.1', label: 'GPT-4.1', maxTokens: 32_000 },
    aiMessages: messages,
    reasoningEffort: 'medium',
  });

  assert(request.max_tokens === 32_000, 'GPT-4.1 should use max_tokens');
  assert(!('reasoning_effort' in request), 'GPT-4.1 must not receive reasoning_effort');
});

Deno.test('keeps reasoning_effort for Gemini OpenAI-compatible requests', () => {
  const request = buildPlannedChatCompletionRequest({
    model: { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', maxTokens: 36_000 },
    aiMessages: messages,
    reasoningEffort: 'medium',
  });

  assert(request.max_tokens === 36_000, 'Gemini should use max_tokens');
  assert(request.reasoning_effort === 'medium', 'Gemini should retain reasoning_effort');
});

Deno.test('keeps GPT-5 completion tokens and reasoning controls', () => {
  const request = buildPlannedChatCompletionRequest({
    model: { id: 'openai/gpt-5-mini', label: 'GPT-5 Mini', maxTokens: 32_000 },
    aiMessages: messages,
    reasoningEffort: 'low',
  });

  assert(request.max_completion_tokens === 32_000, 'GPT-5 should use max_completion_tokens');
  assert(request.reasoning_effort === 'low', 'GPT-5 should retain reasoning_effort');
});

Deno.test('continues from Gemini billing exhaustion to the OpenAI fallback in hybrid mode', async () => {
  const originalFetch = globalThis.fetch;
  const envNames = ['AI_PROVIDER_MODE', 'GEMINI_API_KEY', 'GOOGLE_API_KEY', 'UNISONGEMINI_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'LOVABLE_API_KEY'];
  const originalEnv = new Map(envNames.map((name) => [name, Deno.env.get(name)]));
  const requestedUrls: string[] = [];

  Deno.env.set('AI_PROVIDER_MODE', 'hybrid');
  Deno.env.set('GEMINI_API_KEY', 'test-gemini-key');
  Deno.env.set('OPENAI_API_KEY', 'test-openai-key');
  Deno.env.delete('GOOGLE_API_KEY');
  Deno.env.delete('UNISONGEMINI_API_KEY');
  Deno.env.delete('ANTHROPIC_API_KEY');
  Deno.env.delete('LOVABLE_API_KEY');

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    requestedUrls.push(url);
    if (url.includes('generativelanguage.googleapis.com')) {
      return new Response(JSON.stringify({ error: { message: 'Billing is required.' } }), {
        status: 402,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    if (url.includes('api.openai.com')) {
      return new Response(JSON.stringify({
        choices: [{ message: { content: 'OpenAI recovered the Wizard turn.' } }],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    throw new Error(`Unexpected provider URL: ${url}`);
  }) as typeof fetch;

  try {
    const result = await runProviderLoop({
      aiMessages: messages,
      providerPlan: {
        gatewayModels: [
          { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', maxTokens: 36_000 },
          { id: 'openai/gpt-4.1', label: 'OpenAI GPT-4.1', maxTokens: 32_000 },
        ],
        perModelTimeoutMs: 30_000,
        fallbackMaxTokens: 36_000,
      },
      navPageGen: false,
    });

    assert(result.content === 'OpenAI recovered the Wizard turn.', 'OpenAI should recover the failed Gemini turn');
    assert(result.providerUsed === 'openai', 'the recovered response should identify OpenAI');
    assert(requestedUrls.length === 2, 'the loop should make one Gemini request and one OpenAI request');
    assert(requestedUrls[0].includes('generativelanguage.googleapis.com'), 'Gemini should remain the lead provider');
    assert(requestedUrls[1].includes('api.openai.com'), 'OpenAI should run after Gemini billing exhaustion');
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of originalEnv) {
      if (value === undefined) Deno.env.delete(name);
      else Deno.env.set(name, value);
    }
  }
});
