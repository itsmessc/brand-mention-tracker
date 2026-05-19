import { z } from 'zod';
import { SOURCES, SENTIMENTS } from '../models/Mention.js';

export const MAX_BULK_ROWS = 10_000;

const baseMention = z.object({
  source: z.enum(SOURCES),
  author: z.string().max(200).optional(),
  body: z.string().min(1),
  url: z.string().url().optional().or(z.literal('').transform(() => undefined)),
  externalId: z.string().max(200).optional(),
  postedAt: z.coerce.date(),
  sentiment: z.enum(SENTIMENTS).default('neutral'),
  tags: z.array(z.string()).default([]),
});

export const mentionCreateSchema = baseMention;

export const mentionUpdateSchema = z.object({
  source: z.enum(SOURCES).optional(),
  author: z.string().max(200).optional(),
  body: z.string().min(1).optional(),
  url: z.string().url().optional().or(z.literal('').transform(() => undefined)),
  externalId: z.string().max(200).optional(),
  postedAt: z.coerce.date().optional(),
  sentiment: z.enum(SENTIMENTS).optional(),
  tags: z.array(z.string()).optional(),
});

export const mentionBulkSchema = z.array(z.unknown()).min(1).max(MAX_BULK_ROWS);

export const mentionListQuerySchema = z.object({
  source: z.enum(SOURCES).optional(),
  sentiment: z.enum(SENTIMENTS).optional(),
  tag: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  q: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(25),
});
