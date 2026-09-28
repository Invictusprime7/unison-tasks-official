import {
  buildPlannedChatCompletionRequest,
  reserveFallbackWindow,
  PROVIDER_LOOP_TOTAL_BUDGET_MS,
  runProviderLoop,
} from '../_shared/aiProviderLoop.ts';
import { isPageDesignRequest } from '../_shared/catalogTools.ts';
import { buildResponseBody } from '../_shared/responseNormalizer.ts';

Deno.test('page design requests cannot be diverted into catalog mutations', () => {
  assert(isPageDesignRequest('home is complete. design the other nav pages.'), 'remaining pages require file output');
  assert(isPageDesignRequest('redesign the Services page'), 'page layout needs file output');
  assert(!isPageDesignRequest('change the haircut price to $45'), 'catalog edits retain tools');
});

Deno.test('preserves tool-only fallback success after billing exhaustion and a model timeout', async () => {
  const originalFetch = globalThis.fetch;
  const names = ['AI_PROVIDER_MODE', 'GEMINI_API_KEY', 'GOOGLE_API_KEY', 'UNISONGEMINI_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'LOVABLE_API_KEY'];
  const originalEnv = new Map(names.map(name => [name, Deno.env.get(name)]));
  const calls: string[] = [];
  const toolCalls = [{ id: 'call_test', type: 'function', function: { name: 'updateCatalogRow', arguments: '{"patch":{"price":45}}' } }];
  try {
    for (const name of names) Deno.env.delete(name);
    Deno.env.set('AI_PROVIDER_MODE', 'hybrid');
    Deno.env.set('GEMINI_API_KEY', 'test');
    Deno.env.set('OPENAI_API_KEY', 'test');
    // If failover incorrectly continues, these configured providers must not run.
    Deno.env.set('ANTHROPIC_API_KEY', 'test');
    Deno.env.set('LOVABLE_API_KEY', 'test');
    globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      const request = JSON.parse(String(init?.body));
      calls.push(request.model);
      if (request.model.includes('gemini')) return new Response('{"error":{"message":"Billing is required"}}', { status: 402 });
      if (request.model === 'gpt-4.1') throw new DOMException('Provider attempt timed out', 'TimeoutError');
      if (request.model === 'gpt-4o-mini') return new Response(JSON.stringify({ choices: [{ message: { content: null, tool_calls: toolCalls } }] }));
      throw new Error('Unexpected fallback after success');
    }) as typeof fetch;
    const result = await runProviderLoop({
      aiMessages: [{ role: 'user', content: 'Change the haircut price to $45' }],
      navPageGen: false,
      tools: [{ type: 'function', function: { name: 'updateCatalogRow', parameters: { type: 'object' } } }],
      providerPlan: {
        gatewayModels: ['google/gemini-2.5-flash', 'openai/gpt-4.1', 'openai/gpt-4o-mini'].map(id => ({ id, label: id, maxTokens: 1000 })),
        perModelTimeoutMs: 45000, fallbackMaxTokens: 1000,
      },
    });
    assert(result.modelUsed === 'openai/gpt-4o-mini', 'successful fallback must be returned');
    assert(result.toolCalls?.[0].id === 'call_test', 'tool call must survive');
    assert(calls.length === 3, 'no further providers after tool-only success');
    const body = buildResponseBody(result);
    assert(Array.isArray(body.tool_calls) && body.tool_calls.length === 1, 'HTTP response must forward the tool call');
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of originalEnv) {
      if (value === undefined) Deno.env.delete(name);
      else Deno.env.set(name, value);
    }
  }
});

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const messages = [{ role: 'user', content: 'Generate the requested site.' }];

Deno.test('preserves a full minute for GPT-4.1 after a reasoning timeout', () => {
  assert(reserveFallbackWindow(90_000, 134_800, 60_000) === 72_800, 'lead must preserve fallback time after billing failure');
  assert(reserveFallbackWindow(110_000, 135_000, 60_000) === 73_000, 'Composer must preserve fallback time');
});

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
