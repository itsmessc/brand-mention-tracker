import fs from 'node:fs/promises';
import { mentionService } from '../services/mention.service.js';
import { ingestService } from '../services/ingest.service.js';
import { streamMentionsAsCsv } from '../lib/csv.js';
import { ApiError } from '../lib/ApiError.js';
import { mentionBulkSchema } from '../validators/mention.schema.js';

export const mentionController = {
  async list(req, res) {
    const data = await mentionService.list(req.params.brandId, req.query);
    res.json(data);
  },

  async create(req, res) {
    const mention = await mentionService.create(req.params.brandId, req.body);
    res.status(201).json(mention);
  },

  async update(req, res) {
    const mention = await mentionService.update(req.params.mentionId, req.body);
    res.json(mention);
  },

  async remove(req, res) {
    await mentionService.remove(req.params.mentionId);
    res.status(204).end();
  },

  async bulk(req, res) {
    if (req.file) {
      try {
        const result = await ingestService.ingestCsvFile(
          req.params.brandId,
          req.file.path
        );
        res.status(201).json(result);
      } finally {
        fs.unlink(req.file.path).catch(() => {});
      }
      return;
    }

    const rows = Array.isArray(req.body) ? req.body : req.body?.items;
    if (!Array.isArray(rows)) {
      throw ApiError.badRequest(
        'Provide a JSON array body or a multipart file field "file"'
      );
    }
    const parsed = mentionBulkSchema.safeParse(rows);
    if (!parsed.success) {
      throw ApiError.badRequest('Bulk payload failed validation', parsed.error.flatten());
    }
    const result = await ingestService.ingestRows(req.params.brandId, parsed.data);
    res.status(201).json(result);
  },

  async exportCsv(req, res) {
    const cursor = mentionService.cursorFor(req.params.brandId, req.query);
    await streamMentionsAsCsv(cursor, res);
  },
};
