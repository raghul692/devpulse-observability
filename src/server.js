import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config/env.js';
import { securityHeaders } from './middlewares/security.js';
import { rateLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { healthRouter } from './routes/health.js';
import { apiRouter } from './routes/api.js';
import { MonitorService } from './services/monitorService.js';
import { db } from './models/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public');

export const app = express();

app.use(securityHeaders);
app.use(rateLimiter);
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));
app.use(healthRouter);
app.use('/api/v1', apiRouter);

app.use('/api', (req, res) => {
  res.status(404).json({
    type: 'https://devpulse.internal/errors/not-found',
    title: 'Resource Not Found',
    status: 404,
    detail: `Endpoint ${req.method} ${req.originalUrl} does not exist.`
  });
});

app.use(errorHandler);

let backgroundPulseTimer = null;
export function startBackgroundPulse() {
  if (backgroundPulseTimer) return;
  backgroundPulseTimer = setInterval(() => {
    const monitors = db.getAllMonitors();
    for (const m of monitors) {
      if (m.status !== 'outage') {
        MonitorService.executePing(m.id);
      }
    }
  }, config.pingIntervalMs);
  backgroundPulseTimer.unref();
}

export function stopBackgroundPulse() {
  if (backgroundPulseTimer) {
    clearInterval(backgroundPulseTimer);
    backgroundPulseTimer = null;
  }
}

const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));

if (isMainModule) {
  startBackgroundPulse();
  const server = app.listen(config.port, config.host, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 DEVPULSE OBSERVABILITY HUB IS LIVE!`);
    console.log(`📍 URL:        http://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}`);
    console.log(`📡 Environment: ${config.env}`);
    console.log(`🔒 Security:   Strict CSP, Rate-Limiting & API-Key Guard`);
    console.log(`🩺 Health:     http://localhost:${config.port}/readyz`);
    console.log(`======================================================\n`);
  });

  const handleShutdown = (signal) => {
    console.log(`\n[${signal}] Initiating graceful shutdown...`);
    stopBackgroundPulse();
    server.close(() => {
      console.log('✅ HTTP server closed. Clean exit.');
      process.exit(0);
    });

    setTimeout(() => {
      console.error('⚠️ Forcing process exit after timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));
}
