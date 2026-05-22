import { Request, Response, NextFunction } from 'express';
import { createHash } from 'crypto';
import { config } from '../config';
import rateLimit from 'express-rate-limit';

export function apiKeyAuth(req: Request, res: Response, next: NextFunction): void {
  const key = req.headers['x-kredz-api-key'] as string | undefined;
  if (!key) {
    res.status(401).json({ error: 'missing API key' });
    return;
  }

  const hash = createHash('sha256').update(key).digest('hex');
  if (hash !== config.API_KEY_HASH) {
    res.status(403).json({ error: 'invalid API key' });
    return;
  }

  next();
}

export const rateLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too many requests' },
});

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[kredz-backend] error:', err.message);
  res.status(500).json({ error: 'internal server error' });
}
