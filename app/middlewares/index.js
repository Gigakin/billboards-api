// Imports
const authMiddleware = require("./auth-middleware");
const auditMiddleware = require("./audit-middleware");

// Exports
module.exports = (app, securedRoutes, dbInstance) => {
  auditMiddleware.setDbInstance(dbInstance);
  app.use(auditMiddleware.auditRequests);
  securedRoutes.use(authMiddleware.authorizationCheck);
};
