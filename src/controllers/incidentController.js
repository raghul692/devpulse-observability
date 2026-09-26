import { IncidentService } from '../services/incidentService.js';

export class IncidentController {
  static list(req, res, next) {
    try {
      const incidents = IncidentService.listIncidents();
      res.json({
        success: true,
        data: incidents
      });
    } catch (err) {
      next(err);
    }
  }

  static acknowledge(req, res, next) {
    try {
      const { id } = req.params;
      const inc = IncidentService.acknowledgeIncident(id);
      res.json({
        success: true,
        message: 'Incident acknowledged by on-call engineer',
        data: inc
      });
    } catch (err) {
      next(err);
    }
  }

  static resolve(req, res, next) {
    try {
      const { id } = req.params;
      const inc = IncidentService.resolveIncident(id);
      res.json({
        success: true,
        message: 'Incident resolved and service restored',
        data: inc
      });
    } catch (err) {
      next(err);
    }
  }
}
