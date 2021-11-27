import db from './models/index.mjs';

// import your controllers here
import initLoginController from './controllers/login.mjs';
import initWorkerController from './controllers/worker.mjs';
import initTripsController from './controllers/trips.mjs';

export default function bindRoutes(app) {
  // pass in the db for all items callbacks
  const LoginController = initLoginController(db);
  const WorkerController = initWorkerController();
  const TripsController = initTripsController(db);

  app.post('/api/login/', LoginController.create);
  app.get('/api/worker/:workerId/year/:year/month/:month/schedule', WorkerController.showSchedule);
  app.get('/trips', TripsController.index);
}
