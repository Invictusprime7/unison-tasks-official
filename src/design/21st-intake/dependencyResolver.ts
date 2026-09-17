/**
 * 21st Intake — Dependency allowlist policy (M3).
 *
 * A registry install is never automatically approved simply because
 * dependencies resolve. This module classifies every dependency a quarantined
 * source asks for against Unison's real stack.
 */

export const BASELINE_DEPENDENCIES = [
  'react',
  'react-dom',
  'tailwindcss',
  'framer-motion',
  'lucide-react',
  'embla-carousel-react',
  'class-variance-authority',
  'clsx',
  'tailwind-merge',
] as const;

/** Radix is allowed wholesale via the `@radix-ui/*` scope. */
export const ALLOWED_SCOPES = ['@radix-ui/'] as const;

/** Allowed only when the matching capability is explicitly requested. */
export const CAPABILITY_GATED_DEPENDENCIES = [
  'three',
  '@react-three/fiber',
  '@react-three/drei',
] as const;

/** Always adapted away or rejected — never shipped into generated sites. */
export const REJECTED_DEPENDENCIES = [
  'next',
  'next/image',
  'next/link',
  'next/navigation',
  'next/headers',
  'server-only',
  'gsap',
  'react-spring',
  '@react-spring/web',
  'animejs',
  'swiper',
  'keen-slider',
  'react-slick',
  'slick-carousel',
  'react-icons',
  '@heroicons/react',
  'bootstrap',
  'bulma',
  'headlessui',
  '@headlessui/react',
  '@mui/material',
  'antd',
] as const;

export type DependencyVerdict = 'allowed' | 'capability-gated' | 'rejected' | 'unknown';

export interface DependencyDecision {
  dependency: string;
  verdict: DependencyVerdict;
  reason: string;
}

export interface DependencyAuditResult {
  approved: boolean;
  decisions: DependencyDecision[];
  rejected: string[];
  gated: string[];
  unknown: string[];
}

function baseName(dep: string): string {
  if (dep.startsWith('@')) return dep.split('/').slice(0, 2).join('/');
  return dep.split('/')[0];
}

export function classifyDependency(
  dependency: string,
  allowedCapabilities: readonly string[] = [],
): DependencyDecision {
  const dep = dependency.trim();
  const root = baseName(dep);

  if (REJECTED_DEPENDENCIES.some((r) => dep === r || root === baseName(r))) {
    return { dependency: dep, verdict: 'rejected', reason: 'Disallowed runtime or duplicate subsystem' };
  }
  if (ALLOWED_SCOPES.some((scope) => dep.startsWith(scope))) {
    return { dependency: dep, verdict: 'allowed', reason: 'Approved behavior primitive scope' };
  }
  if ((BASELINE_DEPENDENCIES as readonly string[]).includes(root)) {
    return { dependency: dep, verdict: 'allowed', reason: 'Baseline stack' };
  }
  if ((CAPABILITY_GATED_DEPENDENCIES as readonly string[]).includes(root)) {
    return allowedCapabilities.includes('threeD')
      ? { dependency: dep, verdict: 'capability-gated', reason: 'Permitted by explicit 3D capability gate' }
      : { dependency: dep, verdict: 'rejected', reason: 'Requires the 3D capability gate (Phase 6A)' };
  }
  return { dependency: dep, verdict: 'unknown', reason: 'Not on the allowlist — requires manual review' };
}

export function auditDependencies(
  dependencies: readonly string[],
  allowedCapabilities: readonly string[] = [],
): DependencyAuditResult {
  const decisions = dependencies.map((d) => classifyDependency(d, allowedCapabilities));
  const rejected = decisions.filter((d) => d.verdict === 'rejected').map((d) => d.dependency);
  const gated = decisions.filter((d) => d.verdict === 'capability-gated').map((d) => d.dependency);
  const unknown = decisions.filter((d) => d.verdict === 'unknown').map((d) => d.dependency);
  return { approved: rejected.length === 0 && unknown.length === 0, decisions, rejected, gated, unknown };
}
