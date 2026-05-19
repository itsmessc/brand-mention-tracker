import mongoose from 'mongoose';
import { Mention } from '../models/Mention.js';
import { Brand } from '../models/Brand.js';
import { ApiError } from '../lib/ApiError.js';

export const dashboardService = {
  async forBrand(brandId) {
    const brand = await Brand.findById(brandId).lean();
    if (!brand) throw ApiError.notFound('Brand not found');

    const brandObjId = new mongoose.Types.ObjectId(brandId);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [result] = await Mention.aggregate([
      { $match: { brand: brandObjId } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          bySentiment: [
            { $group: { _id: '$sentiment', count: { $sum: 1 } } },
          ],
          bySource: [
            { $group: { _id: '$source', count: { $sum: 1 } } },
          ],
          topTags: [
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
          ],
          perDay: [
            { $match: { postedAt: { $gte: thirtyDaysAgo } } },
            {
              $group: {
                _id: { $dateTrunc: { date: '$postedAt', unit: 'day' } },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
        },
      },
    ]);

    return {
      brand,
      total: result.total[0]?.count ?? 0,
      bySentiment: result.bySentiment.map((x) => ({ sentiment: x._id, count: x.count })),
      bySource: result.bySource.map((x) => ({ source: x._id, count: x.count })),
      topTags: result.topTags.map((x) => ({ tag: x._id, count: x.count })),
      perDay: fillMissingDays(result.perDay, thirtyDaysAgo),
    };
  },
};

function fillMissingDays(rows, since) {
  const byDate = new Map(
    rows.map((r) => [new Date(r._id).toISOString().slice(0, 10), r.count])
  );
  const out = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let d = new Date(since); d <= today; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    out.push({ date: key, count: byDate.get(key) || 0 });
  }
  return out;
}
