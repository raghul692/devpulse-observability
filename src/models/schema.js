import crypto from 'node:crypto';

export class DataStore {
  constructor() {
    this.monitors = new Map();
    this.pingLogs = [];
    this.incidents = new Map();
    this.seedDefaults();
  }

  seedDefaults() {
    const defaultMonitors = [
      {
        id: 'mon_auth_prod',
        name: 'Auth & Identity Gateway',
        endpoint: 'https://auth.internal.corp/healthz',
        status: 'operational',
        uptimePct: 99.98,
        latencyMs: 42,
        latencyHistory: [45, 43, 40, 48, 42, 41, 43, 39, 42],
        intervalSec: 15,
        lastChecked: new Date().toISOString()
      },
      {
        id: 'mon_billing_api',
        name: 'Stripe & Billing Orchestrator',
        endpoint: 'https://billing.internal.corp/status',
        status: 'operational',
        uptimePct: 99.95,
        latencyMs: 88,
        latencyHistory: [92, 85, 89, 94, 86, 90, 84, 87, 88],
        intervalSec: 15,
        lastChecked: new Date().toISOString()
      },
      {
        id: 'mon_vector_db',
        name: 'Vector Search & AI RAG Engine',
        endpoint: 'https://rag.internal.corp/readyz',
        status: 'operational',
        uptimePct: 99.91,
        latencyMs: 145,
        latencyHistory: [160, 152, 148, 140, 138, 142, 150, 143, 145],
        intervalSec: 15,
        lastChecked: new Date().toISOString()
      },
      {
        id: 'mon_edge_cdn',
        name: 'Cloudflare Edge CDN Cache',
        endpoint: 'https://cdn.internal.corp/ping',
        status: 'operational',
        uptimePct: 100.0,
        latencyMs: 18,
        latencyHistory: [19, 18, 17, 20, 19, 18, 18, 17, 18],
        intervalSec: 15,
        lastChecked: new Date().toISOString()
      }
    ];

    for (const m of defaultMonitors) {
      this.monitors.set(m.id, m);
    }
  }

  getAllMonitors() {
    return Array.from(this.monitors.values());
  }

  getMonitorById(id) {
    return this.monitors.get(id);
  }

  createMonitor({ name, endpoint, intervalSec = 30 }) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      throw new Error('Monitor name is required.');
    }
    if (!endpoint || !endpoint.startsWith('http')) {
      throw new Error('Valid HTTP/HTTPS endpoint URL is required.');
    }

    const id = `mon_${crypto.randomBytes(4).toString('hex')}`;
    const newMonitor = {
      id,
      name: name.trim(),
      endpoint: endpoint.trim(),
      status: 'operational',
      uptimePct: 100.0,
      latencyMs: Math.floor(Math.random() * 50) + 20,
      latencyHistory: [35, 40, 38, 42, 36],
      intervalSec: parseInt(intervalSec, 10) || 30,
      lastChecked: new Date().toISOString()
    };

    this.monitors.set(id, newMonitor);
    return newMonitor;
  }

  updateMonitor(id, patch) {
    const mon = this.monitors.get(id);
    if (!mon) return null;
    const updated = { ...mon, ...patch, lastChecked: new Date().toISOString() };
    this.monitors.set(id, updated);
    return updated;
  }

  deleteMonitor(id) {
    return this.monitors.delete(id);
  }

  recordPing(monitorId, status, latencyMs) {
    const entry = {
      id: crypto.randomUUID(),
      monitorId,
      status,
      latencyMs,
      timestamp: new Date().toISOString()
    };
    this.pingLogs.push(entry);
    if (this.pingLogs.length > 500) {
      this.pingLogs.shift();
    }
    return entry;
  }

  createIncident(monitorId, title, severity = 'high') {
    const id = `inc_${crypto.randomBytes(4).toString('hex')}`;
    const incident = {
      id,
      monitorId,
      title,
      severity,
      state: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.incidents.set(id, incident);
    return incident;
  }

  getAllIncidents() {
    return Array.from(this.incidents.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  resolveIncident(id) {
    const inc = this.incidents.get(id);
    if (!inc) return null;
    inc.state = 'resolved';
    inc.updatedAt = new Date().toISOString();
    return inc;
  }
}

export const db = new DataStore();
