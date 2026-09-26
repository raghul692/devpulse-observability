export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  apiKey: process.env.DEVPULSE_API_KEY || 'devpulse-super-secret-key-2026',
  rateLimit: {
    windowMs: 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '120', 10)
  },
  pingIntervalMs: 15 * 1000,
  version: '1.0.0'
};
