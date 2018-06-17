// Imports
const authRoutes = require("./auth-routes");
const ordersRoutes = require("./orders-routes");
const ownersRoutes = require("./owners-routes");
const partiesRoutes = require("./parties-routes");
const jobsRoutes = require("./jobs-routes");

// Exports
module.exports = (app, securedRoutes, dbInstance) => {
  authRoutes(app, dbInstance);
  ordersRoutes(app, dbInstance);
  ownersRoutes(app, dbInstance);
  partiesRoutes(app, dbInstance);
  jobsRoutes(app, dbInstance);
};
