import { z } from 'zod';

const filtersSchema = z.object({
  source: z.string().optional(),
  sentiment: z.string().optional(),
  tag: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  q: z.string().optional(),
});

export const savedViewCreateSchema = z.object({
  name: z.string().min(1).max(100),
  filters: filtersSchema.default({}),
});
