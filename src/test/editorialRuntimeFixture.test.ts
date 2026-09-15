import { describe, expect, it } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { commitToPipeline } from '@/platform/core/commitToPipeline';
import { buildCanonicalLaunchArtifacts } from '@/services/canonicalLaunchVfs';
import { buildPreviewArtifacts } from '@/utils/previewArtifacts';
import { THEME_PRESETS } from '@/components/onboarding/themePresets';
import { themePresetToThemeTokens } from '@/components/onboarding/themePresetToTokens';

describe('Editorial runtime artifacts', () => {
  it('projects a fresh and reopened editorial launch into the same Preview files', () => {
    const result = commitToPipeline({ selections: { businessName: 'Editorial Verification', businessModel: 'appointment_service', industryOverlay: 'salon', systemType: 'booking', primaryGoal: 'book', secondaryGoals: [], needsBooking: true, wantsLeadCapture: false, primaryIntent: 'booking.create', requestedPages: ['home', 'contact'], scaffoldMode: 'selected-pages', templateId: 'salon-premium', themePresetId: 'editorial', themeTokens: themePresetToThemeTokens(THEME_PRESETS.find(p => p.id === 'editorial')!) } }, 'wizard-launch');
    const launched = buildCanonicalLaunchArtifacts({ generatedFiles: result.siteBundleSnapshot.vfsFiles, siteBundleSnapshot: result.siteBundleSnapshot, compileArtifact: result.compileArtifact, canonicalPlayground: result.playground, themePresetId: 'editorial', templateId: 'salon-premium', systemType: 'booking', businessName: 'Editorial Verification', industry: 'salon' });
    const fresh = buildPreviewArtifacts({ sourceFiles: launched.files });
    const reopened = buildPreviewArtifacts({ sourceFiles: JSON.parse(JSON.stringify(launched.files)) });
    expect(reopened.sandpackFiles).toEqual(fresh.sandpackFiles);
    if (process.env.EMIT_EDITORIAL_FIXTURE) {
      for (const [name, files] of Object.entries({ canonical: launched.files, preview: fresh.sandpackFiles })) {
        const root = resolve('.artifacts/theme-runtime/' + name);
        for (const [path, source] of Object.entries(files)) {
          if (path.startsWith('/.unison/')) continue;
          const target = resolve(root, '.' + path);
          if (!target.startsWith(root)) throw new Error('Fixture path escapes root');
          mkdirSync(dirname(target), { recursive: true });writeFileSync(target, source);
        }
        const entry = name === 'canonical' ? '/src/main.tsx' : '/index.tsx';
        writeFileSync(resolve(root, 'index.html'), '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><div id="root"></div><script type="module" src="' + entry + '"></script></body></html>');
        writeFileSync(resolve(root, 'vite.config.ts'), 'import { defineConfig } from "vite"; import react from "@vitejs/plugin-react-swc"; import path from "node:path"; export default defineConfig({cacheDir:path.resolve(__dirname,".vite-cache"),plugins:[react()], resolve:{dedupe:["react","react-dom"],alias:{"@":path.resolve(__dirname,' + JSON.stringify(name === 'canonical' ? './src' : '.') + ')}},server:{host:"127.0.0.1"}});');
      }
    }
  }, 30000);
});
