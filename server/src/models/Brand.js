import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    keywords: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Brand = mongoose.model('Brand', brandSchema);
