import { it } from 'vitest';
import fs from 'fs';
import { extractLongformFromSource, planLongformPage } from '@/services/resources/longformPages';
it('spark', () => {
  const src = fs.readFileSync('/tmp/lf/Blog.tsx', 'utf8');
  const files = { '/src/pages/Blog.tsx': src, '/src/pages/Home.tsx': "import { SiteNav } from '@/project-components/site/SiteNav';\nimport { SiteFooter } from '@/project-components/site/SiteFooter';\n" };
  const found = extractLongformFromSource(files);
  console.log(JSON.stringify(found.map((f) => [f.kind, f.title.slice(0, 30), f.slug, f.date, f.author]), null, 0));
  const plan = planLongformPage({ record: { id: 'x', name: found[0].title, slug: found[0].slug }, kind: 'articles', resourceKey: 'content:articles', files, existingPaths: ['/', '/insights'], industry: 'agency' });
  console.log(plan.path, plan.linkedFiles);
  const l = plan.files['/src/pages/Blog.tsx'];
  const i = l.indexOf('Read Essay'); console.log(l.slice(i - 250, i + 120));
  fs.writeFileSync('/tmp/lf/BlogLinked.tsx', l);
  fs.writeFileSync('/tmp/lf/Page.tsx', plan.files[plan.filePath]);
});
