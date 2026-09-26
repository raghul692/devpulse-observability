import { db } from '../models/schema.js';

export class MonitorService {
  static getFleetOverview() {
    const monitors = db.getAllMonitors();
    const total = monitors.length;
    const operational = monitors.filter(m => m.status === 'operational').length;
    const degraded = monitors.filter(m => m.status === 'degraded').length;
    const outage = monitors.filter(m => m.status === 'outage').length;

    const avgLatency = total > 0
      ? Math.round(monitors.reduce((acc, m) => acc + m.latencyMs, 0) / total)
      : 0;

    const avgUptime = total > 0
      ? +(monitors.reduce((acc, m) => acc + m.uptimePct, 0) / total).toFixed(2)
      : 100.0;

    return {
      summary: {
        total,
        operational,
        degraded,
        outage,
        avgLatencyMs: avgLatency,
        overallUptimePct: avgUptime,
        systemHealth: outage > 0 ? 'CRITICAL' : degraded > 0 ? 'DEGRADED' : 'OPTIMAL'
      },
      monitors
    };
  }

  static executePing(monitorId) {
    const monitor = db.getMonitorById(monitorId);
    if (!monitor) {
      throw new Error(`Monitor with ID '${monitorId}' not found.`);
    }

    const baseLatency = monitor.status === 'outage' ? 850 : monitor.status === 'degraded' ? 320 : 35;
    const jitter = Math.floor(Math.random() * 25) - 10;
    const latencyMs = Math.max(12, baseLatency + jitter);

    const history = [...(monitor.latencyHistory || []), latencyMs];
    if (history.length > 10) history.shift();

    const updated = db.updateMonitor(monitorId, {
      latencyMs,
      latencyHistory: history
    });

    db.recordPing(monitorId, monitor.status, latencyMs);
    return updated;
  }

  static simulateStatus(monitorId, targetStatus) {
    const valid = ['operational', 'degraded', 'outage'];
    if (!valid.includes(targetStatus)) {
      throw new Error(`Invalid status: ${targetStatus}. Must be one of: ${valid.join(', ')}`);
    }

    const monitor = db.getMonitorById(monitorId);
    if (!monitor) throw new Error('Monitor not found.');

    const patch = { status: targetStatus };
    if (targetStatus === 'outage') {
      patch.uptimePct = +(Math.max(92.0, monitor.uptimePct - 0.4)).toFixed(2);
      patch.latencyMs = 950;
      db.createIncident(monitorId, `Unexpected Outage Detected: ${monitor.name}`, 'critical');
    } else if (targetStatus === 'degraded') {
      patch.latencyMs = 380;
      db.createIncident(monitorId, `Latency Spike on ${monitor.name} (>300ms)`, 'medium');
    } else {
      patch.latencyMs = Math.floor(Math.random() * 40) + 20;
    }

    return db.updateMonitor(monitorId, patch);
  }

  static addMonitor(data) {
    return db.createMonitor(data);
  }

  static removeMonitor(id) {
    const exists = db.getMonitorById(id);
    if (!exists) throw new Error('Monitor does not exist.');
    return db.deleteMonitor(id);
  }
}
