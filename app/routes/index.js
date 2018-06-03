// Imports
const authRoutes = require("./auth-routes");

// Exports
module.exports = (app, dbInstance) => {
  authRoutes(app, dbInstance);
};
