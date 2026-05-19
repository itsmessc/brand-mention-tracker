import Papa from 'papaparse';
import { Mention } from '../models/Mention.js';
import { Brand } from '../models/Brand.js';
import { ApiError } from '../lib/ApiError.js';
import { mentionCreateSchema } from '../validators/mention.schema.js';

function normalizeRow(raw) {
  const out = { ...raw };
  if (typeof out.tags === 'string') {
    out.tags = out.tags
      .split(/[,;|]/)
      .map((t) => t.trim())
      .filter(Boolean);
  }
  if (out.posted_at && !out.postedAt) {
    out.postedAt = out.posted_at;
    delete out.posted_at;
  }
  if (out.external_id && !out.externalId) {
    out.externalId = out.external_id;
    delete out.external_id;
  }
  return out;
}

export const ingestService = {
  parseCsv(buffer) {
    const text = buffer.toString('utf-8');
    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
    });
    if (result.errors.length > 0) {
      throw ApiError.badRequest('CSV parse failed', result.errors.slice(0, 5));
    }
    return result.data;
  },

  async ingest(brandId, rawRows) {
    const exists = await Brand.exists({ _id: brandId });
    if (!exists) throw ApiError.notFound('Brand not found');

    const valid = [];
    const failed = [];

    rawRows.forEach((raw, index) => {
      const normalized = normalizeRow(raw);
      const parsed = mentionCreateSchema.safeParse(normalized);
      if (parsed.success) {
        valid.push({ ...parsed.data, brand: brandId });
      } else {
        failed.push({ row: index, reason: parsed.error.flatten() });
      }
    });

    let added = 0;
    let skippedDuplicates = 0;

    if (valid.length > 0) {
      try {
        const inserted = await Mention.insertMany(valid, { ordered: false });
        added = inserted.length;
      } catch (err) {
        if (err.insertedDocs) {
          added = err.insertedDocs.length;
        }
        const writeErrors = err.writeErrors || err.result?.result?.writeErrors || [];
        for (const we of writeErrors) {
          if (we.err?.code === 11000 || we.code === 11000) {
            skippedDuplicates += 1;
          } else {
            failed.push({ row: we.index ?? null, reason: we.errmsg || we.err?.errmsg || 'write error' });
          }
        }
      }
    }

    return { added, skippedDuplicates, failed, total: rawRows.length };
  },
};
