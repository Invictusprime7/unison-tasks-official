import { describe, it, expect } from 'vitest';
import { matchNaturalLanguage, looksLikeNaturalLanguage } from '@/services/terminal/naturalLanguage';

const FILES: Record<string, string> = {
  '/src/App.tsx': `
import { HashRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.tsx';
import About from './pages/About.tsx';
export default function App() {
  return (<HashRouter><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
  </Routes></HashRouter>);
}`,
  '/src/pages/Home.tsx': `export default function Home() { return (<main><section id="hero"><h1>Hi</h1></section><section id="work"><p>Work</p></section></main>); }`,
  '/src/pages/About.tsx': `export default function About() { return (<main><section id="story"><p>Story</p></section></main>); }`,
};

describe('matchNaturalLanguage — read-only', () => {
  it('maps "show my pages" to routes', () => {
    expect(matchNaturalLanguage('show my pages', FILES)).toMatchObject({ command: 'routes', mutating: false });
  });
  it('maps "where do the buttons go" to intents', () => {
    expect(matchNaturalLanguage('where do the buttons go', FILES)?.command).toBe('intents');
  });
  it('maps "check the site" to diagnose', () => {
    expect(matchNaturalLanguage('check the site', FILES)?.command).toBe('diagnose');
  });
  it('maps a quoted page-text question to a probe', () => {
    expect(matchNaturalLanguage('does the page say "Book now"', FILES)).toMatchObject({ command: 'probe text "Book now"', mutating: false });
  });
});

describe('matchNaturalLanguage — mutating', () => {
  it('maps a page rename and resolves the route', () => {
    const m = matchNaturalLanguage('rename the about page to "Our Studio"', FILES);
    expect(m).toMatchObject({ command: 'page rename page:/about "our studio"', mutating: true });
  });
  it('maps a section removal and resolves the section address', () => {
    const m = matchNaturalLanguage('delete the hero section', FILES);
    expect(m).toMatchObject({ command: 'section rm section:/#hero', mutating: true });
  });
  it('maps a section move scoped to a page', () => {
    const m = matchNaturalLanguage('move the story section up on about', FILES);
    expect(m).toMatchObject({ command: 'section up section:/about#story', mutating: true });
  });
  it('maps file creation', () => {
    expect(matchNaturalLanguage('create a file notes.txt', FILES)).toMatchObject({ command: 'touch /src/notes.txt', mutating: true });
  });
});

describe('matchNaturalLanguage — no match', () => {
  it('returns null for unknown sections', () => {
    expect(matchNaturalLanguage('delete the nonexistent section', FILES)).toBeNull();
  });
  it('returns null for unrelated phrases', () => {
    expect(matchNaturalLanguage('make the site feel more premium', FILES)).toBeNull();
  });
});

describe('looksLikeNaturalLanguage', () => {
  it('treats multi-word phrases as natural language', () => {
    expect(looksLikeNaturalLanguage('make the site feel more premium')).toBe(true);
  });
  it('treats a single token as a command typo', () => {
    expect(looksLikeNaturalLanguage('instal')).toBe(false);
  });
});
