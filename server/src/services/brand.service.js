import { Brand } from '../models/Brand.js';
import { Mention } from '../models/Mention.js';
import { SavedView } from '../models/SavedView.js';
import { ApiError } from '../lib/ApiError.js';

export const brandService = {
  async list() {
    const brands = await Brand.find().sort({ createdAt: -1 }).lean();
    if (brands.length === 0) return [];

    const counts = await Mention.aggregate([
      { $match: { brand: { $in: brands.map((b) => b._id) } } },
      { $group: { _id: '$brand', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    return brands.map((b) => ({ ...b, mentionCount: countMap.get(String(b._id)) || 0 }));
  },

  async getById(id) {
    const brand = await Brand.findById(id).lean();
    if (!brand) throw ApiError.notFound('Brand not found');
    return brand;
  },

  async create(data) {
    try {
      const brand = await Brand.create(data);
      return brand.toObject();
    } catch (err) {
      if (err.code === 11000) throw ApiError.conflict('Brand name must be unique');
      throw err;
    }
  },

  async update(id, data) {
    try {
      const brand = await Brand.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
      if (!brand) throw ApiError.notFound('Brand not found');
      return brand;
    } catch (err) {
      if (err.code === 11000) throw ApiError.conflict('Brand name must be unique');
      throw err;
    }
  },

  async remove(id) {
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) throw ApiError.notFound('Brand not found');
    await Promise.all([
      Mention.deleteMany({ brand: id }),
      SavedView.deleteMany({ brand: id }),
    ]);
  },
};
