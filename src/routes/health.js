import { Router } from 'express';
import { db } from '../models/schema.js';

export const healthRouter = Router();

healthRouter.get('/healthz', (req, res) => {
  res.json({
    status: 'ok',
    uptimeSec: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

healthRouter.get('/readyz', (req, res) => {
  try {
    const monitorCount = db.getAllMonitors().length;
    res.json({
      status: 'ready',
      subsystems: {
        memoryStore: 'healthy',
        activeMonitors: monitorCount,
        processMemoryMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
      },
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({
      status: 'unhealthy',
      error: err.message
    });
  }
});
