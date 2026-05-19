import mongoose from 'mongoose';

const filtersSchema = new mongoose.Schema(
  {
    source: String,
    sentiment: String,
    tag: String,
    from: String,
    to: String,
    q: String,
  },
  { _id: false }
);

const savedViewSchema = new mongoose.Schema(
  {
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    name: { type: String, required: true, trim: true },
    filters: { type: filtersSchema, default: {} },
  },
  { timestamps: true }
);

savedViewSchema.index({ brand: 1, name: 1 }, { unique: true });

export const SavedView = mongoose.model('SavedView', savedViewSchema);
