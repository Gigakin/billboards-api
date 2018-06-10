// Imports
const authRoutes = require("./auth-routes");
const ordersRoutes = require("./orders-routes");

// Exports
module.exports = (app, securedRoutes, dbInstance) => {
  authRoutes(app, dbInstance);
  ordersRoutes(app, dbInstance);
};
