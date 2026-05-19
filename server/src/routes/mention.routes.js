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

const UPLOAD_DIR = path.resolve('uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, _file, cb) => {
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.csv`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
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
