import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { Router } from 'express';
import multer from 'multer';
import { mentionController } from '../controllers/mention.controller.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  mentionCreateSchema,
  mentionUpdateSchema,
  mentionListQuerySchema,
} from '../validators/mention.schema.js';

const UPLOAD_DIR = path.join(os.tmpdir(), 'sanrove-uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const upload = multer({
  dest: UPLOAD_DIR,
  limits: { fileSize: 100 * 1024 * 1024 },
});

export const brandMentionRouter = Router({ mergeParams: true });

brandMentionRouter.get(
  '/',
  validate(mentionListQuerySchema, 'query'),
  asyncHandler(mentionController.list)
);
brandMentionRouter.post(
  '/',
  validate(mentionCreateSchema),
  asyncHandler(mentionController.create)
);
brandMentionRouter.post(
  '/bulk',
  upload.single('file'),
  asyncHandler(mentionController.bulk)
);
brandMentionRouter.get(
  '/export.csv',
  validate(mentionListQuerySchema, 'query'),
  asyncHandler(mentionController.exportCsv)
);

export const mentionRouter = Router();

mentionRouter.put(
  '/:mentionId',
  validate(mentionUpdateSchema),
  asyncHandler(mentionController.update)
);
mentionRouter.delete('/:mentionId', asyncHandler(mentionController.remove));
