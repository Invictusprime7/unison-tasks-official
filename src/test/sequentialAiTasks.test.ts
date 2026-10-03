import { describe, expect, it } from 'vitest';
import { buildSequentialAiTasks } from '@/services/builder/sequentialAiTasks';

describe('buildSequentialAiTasks', () => {
  it('orders local dependencies before their importing files', () => {
    const tasks = buildSequentialAiTasks({
      '/src/pages/Home.tsx': 'import Card from "../components/Card"; export default function Home(){return <Card />} ',
      '/src/components/Card.tsx': 'export default function Card(){return <section />} ',
      '/src/components/Badge.tsx': 'export default function Badge(){return <span />} ',
    }, [], { id: 'candidate-1' }, 1);

    expect(tasks.map((task) => task.paths)).toEqual([
      ['/src/components/Badge.tsx'],
      ['/src/components/Card.tsx'],
      ['/src/pages/Home.tsx'],
    ]);
  });

  it('keeps deletions in a final canonical task', () => {
    const tasks = buildSequentialAiTasks(
      { '/src/pages/Home.tsx': 'export default function Home(){return null}' },
      ['/src/pages/Old.tsx'],
      { id: 'candidate-2' },
      2,
    );

    expect(tasks[tasks.length - 1]).toMatchObject({ deletions: ['/src/pages/Old.tsx'] });
  });
});
