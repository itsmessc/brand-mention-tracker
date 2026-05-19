import mongoose from 'mongoose';

export const SOURCES = ['twitter', 'instagram', 'reddit', 'news'];
export const SENTIMENTS = ['positive', 'neutral', 'negative'];

const mentionSchema = new mongoose.Schema(
  {
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    source: { type: String, enum: SOURCES, required: true },
    author: { type: String, trim: true },
    body: { type: String, required: true },
    url: { type: String, trim: true },
    externalId: { type: String, trim: true },
    postedAt: { type: Date, required: true },
    sentiment: { type: String, enum: SENTIMENTS, default: 'neutral' },
    tags: { type: [String], default: [], index: true },
  },
  { timestamps: true }
);

mentionSchema.index({ brand: 1, postedAt: -1, _id: -1 });
mentionSchema.index({ brand: 1, source: 1, postedAt: -1 });
mentionSchema.index({ brand: 1, sentiment: 1, postedAt: -1 });
mentionSchema.index({ brand: 1, tags: 1, postedAt: -1 });

mentionSchema.index(
  { brand: 1, url: 1 },
  { unique: true, partialFilterExpression: { url: { $type: 'string' } } }
);

mentionSchema.index(
  { brand: 1, source: 1, externalId: 1 },
  { unique: true, partialFilterExpression: { externalId: { $type: 'string' } } }
);

mentionSchema.index({ body: 'text' });

export const Mention = mongoose.model('Mention', mentionSchema);
