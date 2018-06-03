// Imports
const auditMiddleware = require("./audit-middleware");

// Exports
module.exports = (app, dbInstance) => {
  auditMiddleware.setDbInstance(dbInstance);
  app.use(auditMiddleware.auditRequests);
};
