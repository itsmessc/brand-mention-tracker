import { savedViewService } from '../services/savedView.service.js';

export const savedViewController = {
  async list(req, res) {
    const views = await savedViewService.list(req.params.brandId);
    res.json(views);
  },

  async create(req, res) {
    const view = await savedViewService.create(req.params.brandId, req.body);
    res.status(201).json(view);
  },

  async remove(req, res) {
    await savedViewService.remove(req.params.viewId);
    res.status(204).end();
  },
};
