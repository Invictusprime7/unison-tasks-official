import { describe, expect, it } from 'vitest';
import { selectSourceKnowledge } from '@/services/builder/sourceKnowledgeContext';
import { shrinkBuilderTurnPayload } from '@/services/builderPayloadBudget';
import { aiComposerRequestSchema } from '@/contracts/aiComposerContract';

describe('source knowledge for authoring and complex repairs', () => {
  it('includes theme and transitive canonical APIs without unrelated pages or cycles', () => {
    const files = {
      '/src/pages/Home.tsx': "import { Card } from '@/unison/ui'; export default Card;",
      '/src/unison/ui/index.ts': "export { Card } from './Card';",
      '/src/unison/ui/Card.tsx': "import './index'; export const Card = () => <div/>;",
      '/src/index.css': ':root { --primary: 10 20% 30%; }',
      '/package.json': '{"dependencies":{"react":"19"}}',
      '/src/pages/Unrelated.tsx': 'not relevant',
    };
    const selected = selectSourceKnowledge(files, ['/src/pages/Home.tsx']);
    expect(selected['/src/unison/ui/Card.tsx']).toBe(files['/src/unison/ui/Card.tsx']);
    expect(selected['/src/index.css']).toBe(files['/src/index.css']);
    expect(selected['/src/pages/Unrelated.tsx']).toBeUndefined();
  });

  it('bounds encoded multilingual context and never cuts source files', () => {
    const files = {
      '/src/pages/Home.tsx': 'target',
      '/src/index.css': '界"\\'.repeat(9000),
      '/src/project-components/site/Nav.tsx': 'n'.repeat(60001),
    };
    const selected = selectSourceKnowledge(files, ['/src/pages/Home.tsx'], 5000);
    expect(selected).toEqual({ '/src/pages/Home.tsx': 'target' });
    expect(new TextEncoder().encode(JSON.stringify(JSON.stringify(selected))).byteLength).toBeLessThanOrEqual(5000);
  });

  it('shrinks large Composer context without breaking its JSON or target source', () => {
    const request = {
      task: 'site_page_author',
      page: { role: 'home', title: 'Home', route: '/', filePath: '/src/pages/Home.tsx' },
      brief: 'Preserve the visual identity', routes: [],
      files: { '/src/pages/Home.tsx': 'target', '/src/index.css': 'x'.repeat(50000) },
      previousResponse: 'x'.repeat(50000),
    };
    const original = JSON.stringify(request);
    const result = shrinkBuilderTurnPayload({ mode: 'site-page-author', messages: [{ role: 'user', content: original }] }, 8000);
    const decoded = JSON.parse(result.payload.messages[0].content);
    expect(aiComposerRequestSchema.safeParse(decoded).success).toBe(true);
    expect(decoded.files['/src/pages/Home.tsx']).toBe('target');
    expect(result.finalBytes).toBeLessThanOrEqual(8000);
    expect(JSON.stringify(request)).toBe(original);
  });
});
