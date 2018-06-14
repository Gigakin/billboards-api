// Imports
const authRoutes = require("./auth-routes");
const ordersRoutes = require("./orders-routes");
const accountOwnersRoutes = require("./account-owners-routes");
const partiesRoutes = require("./parties-routes");
const jobTypesRoutes = require("./job-types-routes");

// Exports
module.exports = (app, securedRoutes, dbInstance) => {
  authRoutes(app, dbInstance);
  ordersRoutes(app, dbInstance);
  accountOwnersRoutes(app, dbInstance);
  partiesRoutes(app, dbInstance);
  jobTypesRoutes(app, dbInstance);
};
