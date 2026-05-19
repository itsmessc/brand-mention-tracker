import { z } from 'zod';

export const brandCreateSchema = z.object({
  name: z.string().min(1).max(100),
  keywords: z.array(z.string()).default([]),
});

export const brandUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  keywords: z.array(z.string()).optional(),
});
