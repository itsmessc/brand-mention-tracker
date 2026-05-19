import { Router } from 'express';
import { brandController } from '../controllers/brand.controller.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { brandCreateSchema, brandUpdateSchema } from '../validators/brand.schema.js';

export const brandRouter = Router();

brandRouter.get('/', asyncHandler(brandController.list));
brandRouter.post('/', validate(brandCreateSchema), asyncHandler(brandController.create));
brandRouter.get('/:brandId', asyncHandler(brandController.getOne));
brandRouter.put('/:brandId', validate(brandUpdateSchema), asyncHandler(brandController.update));
brandRouter.delete('/:brandId', asyncHandler(brandController.remove));
brandRouter.get('/:brandId/dashboard', asyncHandler(brandController.dashboard));
