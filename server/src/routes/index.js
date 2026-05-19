import { Router } from 'express';
import { brandRouter } from './brand.routes.js';
import { brandMentionRouter, mentionRouter } from './mention.routes.js';
import { brandViewRouter, viewRouter } from './savedView.routes.js';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => res.json({ ok: true }));

apiRouter.use('/brands', brandRouter);
apiRouter.use('/brands/:brandId/mentions', brandMentionRouter);
apiRouter.use('/brands/:brandId/views', brandViewRouter);
apiRouter.use('/mentions', mentionRouter);
apiRouter.use('/views', viewRouter);
