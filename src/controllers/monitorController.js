import { MonitorService } from '../services/monitorService.js';

export class MonitorController {
  static getFleet(req, res, next) {
    try {
      const data = MonitorService.getFleetOverview();
      res.json({
        success: true,
        data,
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (err) {
      next(err);
    }
  }

  static triggerPing(req, res, next) {
    try {
      const { id } = req.params;
      const updated = MonitorService.executePing(id);
      res.json({
        success: true,
        message: 'Ping executed successfully',
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  static create(req, res, next) {
    try {
      const { name, endpoint, intervalSec } = req.body;
      const created = MonitorService.addMonitor({ name, endpoint, intervalSec });
      res.status(201).json({
        success: true,
        message: 'Monitor registered successfully',
        data: created
      });
    } catch (err) {
      next(err);
    }
  }

  static simulateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = MonitorService.simulateStatus(id, status);
      res.json({
        success: true,
        message: `Monitor status updated to ${status}`,
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }

  static remove(req, res, next) {
    try {
      const { id } = req.params;
      MonitorService.removeMonitor(id);
      res.json({
        success: true,
        message: `Monitor ${id} deleted successfully.`
      });
    } catch (err) {
      next(err);
    }
  }
}
