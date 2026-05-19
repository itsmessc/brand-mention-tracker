import { SavedView } from '../models/SavedView.js';
import { Brand } from '../models/Brand.js';
import { ApiError } from '../lib/ApiError.js';

export const savedViewService = {
  async list(brandId) {
    const exists = await Brand.exists({ _id: brandId });
    if (!exists) throw ApiError.notFound('Brand not found');
    return SavedView.find({ brand: brandId }).sort({ createdAt: -1 }).lean();
  },

  async create(brandId, data) {
    const exists = await Brand.exists({ _id: brandId });
    if (!exists) throw ApiError.notFound('Brand not found');
    try {
      const view = await SavedView.create({ ...data, brand: brandId });
      return view.toObject();
    } catch (err) {
      if (err.code === 11000) throw ApiError.conflict('A saved view with this name already exists');
      throw err;
    }
  },

  async remove(id) {
    const view = await SavedView.findByIdAndDelete(id);
    if (!view) throw ApiError.notFound('Saved view not found');
  },
};
