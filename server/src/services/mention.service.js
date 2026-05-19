import { Mention } from '../models/Mention.js';
import { Brand } from '../models/Brand.js';
import { ApiError } from '../lib/ApiError.js';

function buildFilter(brandId, query) {
  const filter = { brand: brandId };
  if (query.source) filter.source = query.source;
  if (query.sentiment) filter.sentiment = query.sentiment;
  if (query.tag) filter.tags = query.tag;
  if (query.from || query.to) {
    filter.postedAt = {};
    if (query.from) filter.postedAt.$gte = new Date(query.from);
    if (query.to) filter.postedAt.$lte = new Date(query.to);
  }
  if (query.q) filter.$text = { $search: query.q };
  return filter;
}

async function assertBrandExists(brandId) {
  const exists = await Brand.exists({ _id: brandId });
  if (!exists) throw ApiError.notFound('Brand not found');
}

export const mentionService = {
  buildFilter,

  async list(brandId, query) {
    await assertBrandExists(brandId);
    const filter = buildFilter(brandId, query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const skip = (page - 1) * limit;

    const projection = query.q ? { score: { $meta: 'textScore' } } : undefined;
    const sort = query.q
      ? { score: { $meta: 'textScore' }, postedAt: -1 }
      : { postedAt: -1 };

    const [items, total] = await Promise.all([
      Mention.find(filter, projection).sort(sort).skip(skip).limit(limit).lean(),
      Mention.countDocuments(filter),
    ]);

    return { items, total, page, limit };
  },

  cursorFor(brandId, query) {
    const filter = buildFilter(brandId, query);
    const sort = query.q ? { score: { $meta: 'textScore' }, postedAt: -1 } : { postedAt: -1 };
    const projection = query.q ? { score: { $meta: 'textScore' } } : undefined;
    return Mention.find(filter, projection).sort(sort).lean().cursor();
  },

  async create(brandId, data) {
    await assertBrandExists(brandId);
    try {
      const mention = await Mention.create({ ...data, brand: brandId });
      return mention.toObject();
    } catch (err) {
      if (err.code === 11000) throw ApiError.conflict('Mention already exists (duplicate url or externalId)');
      throw err;
    }
  },

  async update(id, data) {
    try {
      const mention = await Mention.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
      if (!mention) throw ApiError.notFound('Mention not found');
      return mention;
    } catch (err) {
      if (err.code === 11000) throw ApiError.conflict('Duplicate url or externalId');
      throw err;
    }
  },

  async remove(id) {
    const mention = await Mention.findByIdAndDelete(id);
    if (!mention) throw ApiError.notFound('Mention not found');
  },
};
