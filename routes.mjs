import db from './models/index.mjs';

// import your controllers here
import initLoginController from './controllers/login.mjs';
import initSignupController from './controllers/signup.mjs';
import initTripsController from './controllers/trips.mjs';
import initEventsController from './controllers/events.mjs';
import initOptimisationsController from './controllers/optimisations.mjs';

export default function bindRoutes(app) {
  // pass in the db for all items callbacks
  const LoginController = initLoginController(db);
  const SignupController = initSignupController(db);
  const TripsController = initTripsController(db);
  const EventsController = initEventsController(db);
  const OptimisationsController = initOptimisationsController(db);

  // Auth
  app.post('/api/login/', LoginController.create);
  app.post('/api/dj-rest-auth/registration', SignupController.create);

  // Worker
  app.get('/api/worker/:workerId/year/:year/month/:month/schedule', EventsController.showWorkerEventsByMonth);
  app.post('/api/worker/:workerId/event', EventsController.workerCreate);
  app.put('/api/worker/:workerId/event/:eventId', EventsController.workerEdit);
  app.delete('/api/worker/:workerId/event/:eventId', EventsController.workerDelete);

  // Admin
  app.get('/api/admin/:adminId/year/:year/month/:month/schedule', EventsController.showAdminEventsByMonth);
  app.get('/api/admin/:adminId/year/:year/month/:month/optimisations', OptimisationsController.show);
  app.put('/api/admin/:adminId/schedule/:scheduleId/select', OptimisationsController.select);
  app.put('/api/admin/:adminId/optimisation/:optimisationId', OptimisationsController.edit);
  app.delete('/api/admin/:adminId/optimisation/:optimisationId', OptimisationsController.adminDelete);
  app.post('/api/admin/:adminId/optimisation', OptimisationsController.create);

  app.get('/trips', TripsController.index);
}
