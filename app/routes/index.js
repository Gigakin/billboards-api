// Imports
const authRoutes = require("./auth-routes");

// Exports
module.exports = (app, db) => {
  authRoutes(app, db);
};
