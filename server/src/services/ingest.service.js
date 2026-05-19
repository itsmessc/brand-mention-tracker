import fs from 'node:fs';
import { parse as parseCsv } from 'csv-parse';
import { Mention } from '../models/Mention.js';
import { Brand } from '../models/Brand.js';
import { ApiError } from '../lib/ApiError.js';
import { mentionCreateSchema, MAX_BULK_ROWS } from '../validators/mention.schema.js';

const BATCH_SIZE = 500;

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

function classifyInsertError(err) {
  const writeErrors = err?.writeErrors || err?.result?.result?.writeErrors || [];
  let duplicates = 0;
  const otherFailures = [];
  for (const we of writeErrors) {
    const code = we.err?.code ?? we.code;
    if (code === 11000) duplicates += 1;
    else otherFailures.push({ row: we.index ?? null, reason: we.errmsg || we.err?.errmsg || 'write error' });
  }
  const insertedCount = Array.isArray(err?.insertedDocs) ? err.insertedDocs.length : 0;
  return { duplicates, otherFailures, insertedCount };
}

async function flushBatch(batch) {
  if (batch.length === 0) return { added: 0, duplicates: 0, failures: [] };
  try {
    const inserted = await Mention.insertMany(batch, { ordered: false });
    return { added: inserted.length, duplicates: 0, failures: [] };
  } catch (err) {
    const { duplicates, otherFailures, insertedCount } = classifyInsertError(err);
    return { added: insertedCount, duplicates, failures: otherFailures };
  }
}

async function assertBrandExists(brandId) {
  const exists = await Brand.exists({ _id: brandId });
  if (!exists) throw ApiError.notFound('Brand not found');
}

export const ingestService = {
  async ingestRows(brandId, rawRows) {
    await assertBrandExists(brandId);
    if (rawRows.length > MAX_BULK_ROWS) {
      throw ApiError.badRequest(`Too many rows. Max ${MAX_BULK_ROWS} per request.`);
    }

    const result = { added: 0, skippedDuplicates: 0, failed: [], total: rawRows.length };
    let batch = [];

    for (let i = 0; i < rawRows.length; i += 1) {
      const parsed = mentionCreateSchema.safeParse(normalizeRow(rawRows[i]));
      if (!parsed.success) {
        result.failed.push({ row: i, reason: parsed.error.flatten() });
        continue;
      }
      batch.push({ ...parsed.data, brand: brandId });

      if (batch.length >= BATCH_SIZE) {
        const out = await flushBatch(batch);
        result.added += out.added;
        result.skippedDuplicates += out.duplicates;
        result.failed.push(...out.failures);
        batch = [];
      }
    }
    const tail = await flushBatch(batch);
    result.added += tail.added;
    result.skippedDuplicates += tail.duplicates;
    result.failed.push(...tail.failures);

    return result;
  },

  async ingestCsvFile(brandId, filePath) {
    await assertBrandExists(brandId);

    const result = { added: 0, skippedDuplicates: 0, failed: [], total: 0 };
    let batch = [];
    let aborted = null;

    const parser = fs.createReadStream(filePath).pipe(
      parseCsv({
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
      })
    );

    try {
      for await (const rawRow of parser) {
        result.total += 1;
        if (result.total > MAX_BULK_ROWS) {
          aborted = `Aborted at ${MAX_BULK_ROWS} rows. Split the file and try again.`;
          break;
        }

        const parsed = mentionCreateSchema.safeParse(normalizeRow(rawRow));
        if (!parsed.success) {
          result.failed.push({ row: result.total - 1, reason: parsed.error.flatten() });
          continue;
        }
        batch.push({ ...parsed.data, brand: brandId });

        if (batch.length >= BATCH_SIZE) {
          const out = await flushBatch(batch);
          result.added += out.added;
          result.skippedDuplicates += out.duplicates;
          result.failed.push(...out.failures);
          batch = [];
        }
      }
      const tail = await flushBatch(batch);
      result.added += tail.added;
      result.skippedDuplicates += tail.duplicates;
      result.failed.push(...tail.failures);
    } catch (err) {
      if (err?.code === 'CSV_INVALID_OPENING_QUOTE' || err?.code?.startsWith?.('CSV_')) {
        throw ApiError.badRequest(`CSV parse failed: ${err.message}`);
      }
      throw err;
    }

    if (aborted) result.aborted = aborted;
    return result;
  },
};
