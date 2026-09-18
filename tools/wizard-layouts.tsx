import { MemoryRouter } from 'react-router-dom';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { LauncherWizard } from '../src/components/onboarding/wizard/LauncherWizard';
import '../src/index.css';
if (import.meta.env.DEV) createRoot(document.getElementById('root')!).render(<MemoryRouter><LauncherWizard open onOpenChange={() => {}} /></MemoryRouter>);
