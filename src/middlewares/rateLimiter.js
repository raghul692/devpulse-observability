import { config } from '../config/env.js';

const requestCounts = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of requestCounts.entries()) {
    if (now - entry.startTime > config.rateLimit.windowMs) {
      requestCounts.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref();

export function rateLimiter(req, res, next) {
  if (req.path === '/healthz' || req.path === '/readyz') {
    return next();
  }

  const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();

  let clientRecord = requestCounts.get(clientIp);

  if (!clientRecord || (now - clientRecord.startTime) > config.rateLimit.windowMs) {
    clientRecord = {
      startTime: now,
      count: 1
    };
    requestCounts.set(clientIp, clientRecord);
  } else {
    clientRecord.count += 1;
  }

  const remaining = Math.max(0, config.rateLimit.maxRequests - clientRecord.count);
  res.setHeader('X-RateLimit-Limit', config.rateLimit.maxRequests);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil((clientRecord.startTime + config.rateLimit.windowMs) / 1000));

  if (clientRecord.count > config.rateLimit.maxRequests) {
    return res.status(429).json({
      type: 'https://devpulse.internal/errors/rate-limit-exceeded',
      title: 'Too Many Requests',
      status: 429,
      detail: `Rate limit of ${config.rateLimit.maxRequests} requests per minute exceeded. Retry in a few seconds.`
    });
  }

  next();
}
