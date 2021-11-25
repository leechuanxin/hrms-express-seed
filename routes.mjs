import db from './models/index.mjs';

// import your controllers here
import initLoginController from './controllers/login.mjs';
import initTripsController from './controllers/trips.mjs';

export default function bindRoutes(app) {
  // pass in the db for all items callbacks
  const LoginController = initLoginController();
  const TripsController = initTripsController(db);

  app.post('/api/login/', LoginController.login);
  app.get('/trips', TripsController.index);
}
