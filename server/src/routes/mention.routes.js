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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
});

// Brand-scoped mention endpoints. Mounted under /api/brands/:brandId/mentions
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

// Flat mention endpoints for edit/delete. Mounted under /api/mentions
export const mentionRouter = Router();

mentionRouter.put(
  '/:mentionId',
  validate(mentionUpdateSchema),
  asyncHandler(mentionController.update)
);
mentionRouter.delete('/:mentionId', asyncHandler(mentionController.remove));
