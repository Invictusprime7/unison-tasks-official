import { z } from 'zod';
export const briefSchema = z.object({
  businessName: z.string().max(300), industry: z.string().max(100),
  launchSeed: z.string().max(150), vision: z.string().max(8000).optional(),
  goal: z.string().max(100).optional(), needs: z.array(z.string().max(100)).max(30).optional(),
  roles: z.array(z.string().max(40)).min(1).max(13), pack: z.string().max(80),
  variants: z.array(z.object({ id: z.string().max(100), family: z.string().max(40),
    description: z.string().max(1200), pageRoles: z.array(z.string().max(40)).max(13),
    preferredSource: z.boolean(), certification: z.string().max(40),
    tags: z.array(z.string().max(80)).max(30).optional(),
  }).strict()).min(1).max(300),
  task: z.string().max(1000).optional(), designGuidance: z.string().max(2000).optional(),
  constraints: z.string().max(3000).optional(), output: z.unknown().optional(),
}).strict();
