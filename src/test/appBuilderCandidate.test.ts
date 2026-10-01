import { describe, expect, it } from 'vitest';
import { compileResolvedSiteDesignContext } from '@/services/launch/resolvedSiteDesignContext';
import { validateAppBuildCandidate } from '@/services/app-builder/appBuilderCandidate';
import { APP_BUILDER_PROTOCOL_VERSION, type AppBuildContract } from '@/services/app-builder/appBuilderContracts';

function contract(): AppBuildContract {
  const resolvedSiteDesignContext = compileResolvedSiteDesignContext({
    designSeed: 'candidate-closure', businessModel: 'general' as never,
    industry: 'salon', roles: ['home', 'contact'],
  });
  return {
    protocolVersion: APP_BUILDER_PROTOCOL_VERSION,
    identity: { projectId: 'project-1', businessId: 'business-1', siteId: 'site-1', systemType: 'website' },
    topology: {
      sitePlan: {
        siteId: 'topology-1', industry: 'salon', businessName: 'Northstar', homePageId: 'home',
        pages: [
          { id: 'home', name: 'home', title: 'Home', route: '/', role: 'home', filePath: '/src/pages/Home.tsx', visibleInNav: true, isHome: true, generatedBy: 'wizard' },
          { id: 'contact', name: 'contact', title: 'Contact', route: '/contact', role: 'contact', filePath: '/src/pages/Contact.tsx', visibleInNav: true, isHome: false, generatedBy: 'wizard' },
        ],
        navItems: ['home', 'contact'], funnels: [], redirects: [], generatedAt: '2026-09-30T12:00:00.000Z',
      },
      pageRegistry: { pages: {}, funnels: {}, homePageId: 'home', version: 1 },
    },
    business: { industry: 'salon', businessName: 'Northstar', goals: [], intents: [], capabilities: [], bindingGuide: '' },
    design: {
      seed: 'candidate-closure', themePresetId: 'editorial', themeTokens: {} as never,
      artDirection: {} as never, resolvedSiteDesignContext, uiFoundation: {} as never,
      registryContext: {} as never, compositionPlan: { industryId: 'salon', seed: 'candidate-closure', pages: [] },
    },
    runtime: {
      framework: 'react-vite', language: 'typescript', styling: 'tailwind',
      protectedPaths: ['/src/main.tsx'], approvedDependencies: [], approvedExperienceCapabilities: [],
    },
  };
}

const initialFiles = {
  '/src/main.tsx': 'import React from "react";',
  '/src/pages/Home.tsx': 'export default function Home(){return <main>Baseline</main>}',
  '/src/pages/Contact.tsx': 'export default function Contact(){return <main>Baseline</main>}',
};

describe('App Builder candidate closure', () => {
  it('accepts a complete multi-page candidate with project-local companion modules', () => {
    const files = {
      ...initialFiles,
      '/src/pages/Home.tsx': 'import Card from "../project-components/Card"; export default function Home(){return <main><Card /></main>}',
      '/src/pages/Contact.tsx': 'export default function Contact(){return <main>Contact</main>}',
      '/src/project-components/Card.tsx': 'export default function Card(){return <section>Card</section>}',
    };
    const report = validateAppBuildCandidate({ contract: contract(), files, initialFiles });

    expect(report.ok).toBe(true);
    expect(report.issues.filter((issue) => issue.severity === 'blocker')).toEqual([]);
    expect(report.sourceHash).toMatch(/^fnv1a:/);
  });

  it('blocks missing pages, unresolved companions and protected infrastructure changes', () => {
    const files = {
      '/src/main.tsx': 'changed canonical entry',
      '/src/pages/Home.tsx': 'import Missing from "../project-components/Missing"; export default function Home(){return <Missing />}',
    };
    const report = validateAppBuildCandidate({ contract: contract(), files, initialFiles });
    const codes = report.issues.filter((issue) => issue.severity === 'blocker').map((issue) => issue.code);

    expect(report.ok).toBe(false);
    expect(codes).toEqual(expect.arrayContaining([
      'page-body-missing',
      'protected-source-changed',
      'module-closure-unresolved-import',
    ]));
  });
});

