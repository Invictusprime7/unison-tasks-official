import { describe, expect, it } from 'vitest';
import { runComposerLane } from '../../supabase/functions/ai-code-assistant/composerLane';
const req = { task: 'site_page_author', page: { role: 'home', title: 'Home', route: '/', filePath: '/src/pages/Home.tsx' }, brief: 'b', files: {}, routes: [] };
describe('composer file-block output', () => {
  it('parses raw file blocks containing quotes, backslashes and template literals', async () => {
    const src = 'export default function Home(){const s=`a "q" \\n ${1}`;return <main><h1>{s}</h1></main>}';
    const out = `SUMMARY: Home page\n<<<FILE replace /src/pages/Home.tsx\n${src}\n>>>END\nINTENTS: nav.goto`;
    const res = await runComposerLane(JSON.stringify(req), {}, async () => ({ content: out }));
    expect(res.status).toBe(200);
    const body = JSON.parse((await res.json()).content);
    expect(body.fileOps[0]).toEqual({ type: 'replace', path: '/src/pages/Home.tsx', content: src });
    expect(body.intentsUsed).toEqual(['nav.goto']);
  });
});
