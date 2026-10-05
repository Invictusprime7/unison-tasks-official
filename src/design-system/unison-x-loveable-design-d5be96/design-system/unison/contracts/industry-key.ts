const aliases: Record<string, string> = {
  barber: 'salon', medspa: 'salon', wellness: 'salon', dental: 'local-service',
  healthcare: 'local-service', contractor: 'local-service', local_service: 'local-service',
  hvac: 'local-service', cleaning: 'local-service', landscaping: 'local-service',
  auto_detailing: 'local-service', moving: 'local-service', legal: 'agency',
  realestate: 'real-estate', real_estate: 'real-estate', charity: 'nonprofit',
};

export function normalizeIndustryKey(industry: string | null | undefined): string {
  const key = (industry ?? '').trim().toLowerCase();
  return aliases[key] ?? key;
}
