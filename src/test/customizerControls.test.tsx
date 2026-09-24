import { act, renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useTemplateCustomizer } from '@/hooks/useTemplateCustomizer';
import { readCustomizerSectionData, collectCustomizerImages, applyCustomizerSectionData, isCustomizerPageEdit } from '@/services/builder/customizerDraft';
const source = 'const SECTIONS = ' + JSON.stringify([{id:'hero',type:'hero',variantId:'hero-centered',props:{image:{src:'old.jpg',alt:'Old'}}},{id:'gallery',type:'gallery',props:{}}]) + ';\nconst HYDRATABLE = {};';
describe('Customizer controls', () => {
 it('restores saved controls on cancel and when reopening a project', () => {
  const {result} = renderHook(useTemplateCustomizer);
  act(() => result.current.loadProject(source, '', ':root { --primary: 120 100% 50%; --font-heading: Georgia; }'));
  expect(result.current.colors.primary).toBe('#00ff00');
  expect(result.current.typography.headingFont).toBe('Georgia');
  act(() => { result.current.updateColor('primary','#ff0000'); result.current.updateTypography('bodySize','1.25rem'); result.current.updateSpacing('elementGap','32px'); result.current.resizeSection('hero','400px'); result.current.toggleSectionVisibility('gallery'); result.current.reorderSections(0,1); result.current.replaceImage(result.current.images[0].id,'new.jpg','New'); });
  const edited = result.current.applyOverrides(source), css = result.current.generateOverrideCSS();
  expect(readCustomizerSectionData(edited)?.[0]).toMatchObject({id:'gallery',hidden:true});
  expect(edited).toContain('new.jpg');
  expect(css).toContain('--primary: 0 100% 50% !important');
  expect(css).toContain('gap: 32px !important');
  act(() => result.current.resetAll());
  expect(result.current.isDirty).toBe(false);
  expect(result.current.images[0].src).toBe('old.jpg');
  expect(result.current.colors.primary).toBe('#00ff00');
  act(() => result.current.loadProject(edited,css,''));
  expect(result.current.colors.primary).toBe('#ff0000');
  expect(result.current.typography.bodySize).toBe('1.25rem');
  expect(result.current.sections.find(s=>s.id==='hero')?.height).toBe('400px');
  act(() => result.current.updateColor('primary','#0000ff'));
  act(() => result.current.resetAll());
  expect(result.current.colors.primary).toBe('#ff0000');
  expect(result.current.images[0].src).toBe('new.jpg');
  expect(result.current.sections.find(s=>s.id==='hero')?.height).toBe('400px');
 });
});

it('maps full-bleed hero replacements to the rendered background and rejects code edits', () => {
 const before = 'const SECTIONS = ' + JSON.stringify([{id:'hero',type:'hero',variantId:'hero:full-bleed',props:{image:'old.jpg'}}]) + ';\nconst HYDRATABLE = {};';
 const images = collectCustomizerImages(before);
 images[0].src = 'uploaded.jpg';
 const after = applyCustomizerSectionData(before,[],images);
 expect(readCustomizerSectionData(after)?.[0].props).toMatchObject({image:'uploaded.jpg',backgroundImage:'uploaded.jpg'});
 expect(collectCustomizerImages(after)).toHaveLength(1);
 expect(isCustomizerPageEdit(before,after,'/src/pages/Home.tsx')).toBe(true);
 expect(isCustomizerPageEdit(before,after+'\nalert(1)','/src/pages/Home.tsx')).toBe(false);
});
