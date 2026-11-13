import { z } from 'zod';

export const healthSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  database: z.enum(['up', 'down']),
  uptimeSeconds: z.number(),
  timestamp: z.iso.datetime(),
});
export type Health = z.infer<typeof healthSchema>;
