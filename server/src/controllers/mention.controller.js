import { mentionService } from '../services/mention.service.js';
import { ingestService } from '../services/ingest.service.js';
import { streamMentionsAsCsv } from '../lib/csv.js';
import { ApiError } from '../lib/ApiError.js';

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
    let rows;
    if (req.file) {
      rows = ingestService.parseCsv(req.file.buffer);
    } else if (Array.isArray(req.body)) {
      rows = req.body;
    } else if (Array.isArray(req.body?.items)) {
      rows = req.body.items;
    } else {
      throw ApiError.badRequest('Provide a JSON array body or a multipart file field "file"');
    }
    const result = await ingestService.ingest(req.params.brandId, rows);
    res.status(201).json(result);
  },

  async exportCsv(req, res) {
    const cursor = mentionService.cursorFor(req.params.brandId, req.query);
    await streamMentionsAsCsv(cursor, res);
  },
};
