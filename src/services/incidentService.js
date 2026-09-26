import { db } from '../models/schema.js';

export class IncidentService {
  static listIncidents() {
    return db.getAllIncidents();
  }

  static acknowledgeIncident(id) {
    const inc = db.incidents.get(id);
    if (!inc) {
      throw new Error(`Incident with id '${id}' not found.`);
    }
    inc.state = 'acknowledged';
    inc.updatedAt = new Date().toISOString();
    return inc;
  }

  static resolveIncident(id) {
    const inc = db.resolveIncident(id);
    if (!inc) {
      throw new Error(`Incident with id '${id}' not found.`);
    }
    const mon = db.getMonitorById(inc.monitorId);
    if (mon && mon.status !== 'operational') {
      db.updateMonitor(inc.monitorId, {
        status: 'operational',
        latencyMs: 35
      });
    }
    return inc;
  }
}
