// Imports
const authRoutes = require("./auth-routes");

// Exports
module.exports = (app, securedRoutes, dbInstance) => {
  authRoutes(app, dbInstance);
};
