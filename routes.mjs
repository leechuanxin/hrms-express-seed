import db from './models/index.mjs';

// import your controllers here
import initLoginController from './controllers/login.mjs';
import initSignupController from './controllers/signup.mjs';
import initTripsController from './controllers/trips.mjs';
import initEventsController from './controllers/events.mjs';

export default function bindRoutes(app) {
  // pass in the db for all items callbacks
  const LoginController = initLoginController(db);
  const SignupController = initSignupController(db);
  // const WorkerController = initWorkerController();
  const TripsController = initTripsController(db);
  const EventsController = initEventsController(db);

  // Auth
  app.post('/api/login/', LoginController.create);
  app.post('/api/dj-rest-auth/registration', SignupController.create);

  // Worker
  app.get('/api/worker/:workerId/year/:year/month/:month/schedule', EventsController.showWorkerEventsByMonth);
  app.post('/api/worker/:workerId/event', EventsController.workerCreate);
  app.delete('/api/worker/:workerId/event/:eventId', EventsController.workerDelete);

  app.get('/trips', TripsController.index);
}
