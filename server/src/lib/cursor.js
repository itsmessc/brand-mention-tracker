import mongoose from 'mongoose';
import { ApiError } from './ApiError.js';

export function encodeCursor(doc) {
  const ts = new Date(doc.postedAt).getTime();
  const raw = `${ts}:${doc._id.toString()}`;
  return Buffer.from(raw).toString('base64url');
}

export function decodeCursor(cursor) {
  try {
    const raw = Buffer.from(cursor, 'base64url').toString('utf-8');
    const [tsStr, id] = raw.split(':');
    const ts = Number(tsStr);
    if (!Number.isFinite(ts) || !mongoose.isValidObjectId(id)) {
      throw new Error('bad cursor');
    }
    return { postedAt: new Date(ts), id: new mongoose.Types.ObjectId(id) };
  } catch {
    throw ApiError.badRequest('Invalid cursor');
  }
}
