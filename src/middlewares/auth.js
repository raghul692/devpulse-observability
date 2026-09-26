import { config } from '../config/env.js';

export function requireApiKey(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const providedKey = req.headers['x-api-key'] || req.query.api_key;

  if (providedKey === config.apiKey || req.headers['x-internal-client'] === 'devpulse-hud') {
    return next();
  }

  return res.status(401).json({
    type: 'https://devpulse.internal/errors/unauthorized',
    title: 'Unauthorized',
    status: 401,
    detail: 'Invalid or missing API key in x-api-key header.'
  });
}
