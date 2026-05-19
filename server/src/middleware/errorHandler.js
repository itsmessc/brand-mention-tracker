import { ApiError } from '../lib/ApiError.js';

export function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      error: err.message,
      details: err.details,
    });
  }

  if (err?.name === 'ValidationError') {
    return res.status(400).json({ error: 'Validation failed', details: err.errors });
  }

  if (err?.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid id' });
  }

  if (err?.name === 'MulterError') {
    return res.status(400).json({ error: `Upload error: ${err.message}`, code: err.code });
  }

  console.error('[error]', err);
  return res.status(500).json({ error: 'Internal server error' });
}
