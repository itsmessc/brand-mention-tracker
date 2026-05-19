import { Mention } from '../models/Mention.js';
import { Brand } from '../models/Brand.js';
import { ApiError } from '../lib/ApiError.js';
import { encodeCursor, decodeCursor } from '../lib/cursor.js';

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
    const baseFilter = buildFilter(brandId, query);
    const limit = query.limit ?? 25;
    const useTextMode = !!query.q;

    if (useTextMode) {
      const page = query.page ?? 1;
      const skip = (page - 1) * limit;
      const [items, total] = await Promise.all([
        Mention.find(baseFilter, { score: { $meta: 'textScore' } })
          .sort({ score: { $meta: 'textScore' }, postedAt: -1, _id: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Mention.countDocuments(baseFilter),
      ]);
      return { items, total, mode: 'skip', page, limit };
    }

    let finalFilter = baseFilter;
    if (query.cursor) {
      const c = decodeCursor(query.cursor);
      finalFilter = {
        $and: [
          baseFilter,
          {
            $or: [
              { postedAt: { $lt: c.postedAt } },
              { postedAt: c.postedAt, _id: { $lt: c.id } },
            ],
          },
        ],
      };
    }

    const [items, total] = await Promise.all([
      Mention.find(finalFilter).sort({ postedAt: -1, _id: -1 }).limit(limit + 1).lean(),
      Mention.countDocuments(baseFilter),
    ]);

    const hasMore = items.length > limit;
    const trimmed = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore && trimmed.length > 0 ? encodeCursor(trimmed[trimmed.length - 1]) : null;

    return { items: trimmed, total, nextCursor, mode: 'keyset', limit };
  },

  cursorFor(brandId, query) {
    const filter = buildFilter(brandId, query);
    const sort = query.q
      ? { score: { $meta: 'textScore' }, postedAt: -1, _id: -1 }
      : { postedAt: -1, _id: -1 };
    const projection = query.q ? { score: { $meta: 'textScore' } } : undefined;
    return Mention.find(filter, projection).sort(sort).lean().cursor();
  },

  async create(brandId, data) {
    await assertBrandExists(brandId);
    try {
      const mention = await Mention.create({ ...data, brand: brandId });
      return mention.toObject();
    } catch (err) {
      if (err.code === 11000) {
        throw ApiError.conflict('Mention already exists for this brand (duplicate url or externalId)');
      }
      throw err;
    }
  },

  async update(id, data) {
    try {
      const mention = await Mention.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).lean();
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
