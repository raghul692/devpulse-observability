import { Router } from 'express';
import { MonitorController } from '../controllers/monitorController.js';
import { IncidentController } from '../controllers/incidentController.js';
import { requireApiKey } from '../middlewares/auth.js';

export const apiRouter = Router();

apiRouter.get('/monitors', MonitorController.getFleet);
apiRouter.post('/monitors', requireApiKey, MonitorController.create);
apiRouter.post('/monitors/:id/ping', MonitorController.triggerPing);
apiRouter.post('/monitors/:id/simulate', requireApiKey, MonitorController.simulateStatus);
apiRouter.delete('/monitors/:id', requireApiKey, MonitorController.remove);

apiRouter.get('/incidents', IncidentController.list);
apiRouter.patch('/incidents/:id/acknowledge', requireApiKey, IncidentController.acknowledge);
apiRouter.patch('/incidents/:id/resolve', requireApiKey, IncidentController.resolve);
