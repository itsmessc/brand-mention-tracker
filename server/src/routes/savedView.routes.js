import { Router } from 'express';
import { savedViewController } from '../controllers/savedView.controller.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { savedViewCreateSchema } from '../validators/savedView.schema.js';

export const brandViewRouter = Router({ mergeParams: true });

brandViewRouter.get('/', asyncHandler(savedViewController.list));
brandViewRouter.post(
  '/',
  validate(savedViewCreateSchema),
  asyncHandler(savedViewController.create)
);

export const viewRouter = Router();
viewRouter.delete('/:viewId', asyncHandler(savedViewController.remove));
