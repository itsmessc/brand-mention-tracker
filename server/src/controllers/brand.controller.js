import { brandService } from '../services/brand.service.js';
import { dashboardService } from '../services/dashboard.service.js';

export const brandController = {
  async list(req, res) {
    const brands = await brandService.list();
    res.json(brands);
  },

  async getOne(req, res) {
    const brand = await brandService.getById(req.params.brandId);
    res.json(brand);
  },

  async create(req, res) {
    const brand = await brandService.create(req.body);
    res.status(201).json(brand);
  },

  async update(req, res) {
    const brand = await brandService.update(req.params.brandId, req.body);
    res.json(brand);
  },

  async remove(req, res) {
    await brandService.remove(req.params.brandId);
    res.status(204).end();
  },

  async dashboard(req, res) {
    const data = await dashboardService.forBrand(req.params.brandId);
    res.json(data);
  },
};
