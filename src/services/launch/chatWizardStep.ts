export const CHAT_WIZARD_STEPS = ['industry', 'goals', 'questions', 'pages', 'aesthetic', 'brand', 'confirm'] as const;
export type ChatWizardStep = typeof CHAT_WIZARD_STEPS[number];

export function getChatWizardStep(content: string, explicit?: unknown): ChatWizardStep {
  if (CHAT_WIZARD_STEPS.includes(explicit as ChatWizardStep)) return explicit as ChatWizardStep;
  const marker = content.match(/<UNISON_WIZARD_STEP:(industry|goals|questions|pages|aesthetic|brand|confirm)>/);
  if (marker) return marker[1] as ChatWizardStep;
  if (content.includes('<UNISON_SITE_CONFIRMATION>')) return 'confirm';
  // Compatibility with deployed discovery replies that predate step metadata.
  const question = content.split(/(?<=[.!])\s+/).filter(part => part.includes('?')).pop() ?? content;
  if (/brand name|business name|call (?:your|the)|name (?:your|the)/i.test(question)) return 'brand';
  if (/visual|aesthetic|art direction|colou?r|style|look and feel/i.test(question)) return 'aesthetic';
  if (/pages|sections|navigation/i.test(question)) return 'pages';
  if (/visitors? (?:do|to do)|visitor actions|customers? (?:do|to do)|features|functionality/i.test(question)) return 'questions';
  if (/goal|accomplish|outcome|achieve|priority/i.test(question)) return 'goals';
  return 'industry';
}
