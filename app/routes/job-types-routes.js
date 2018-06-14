// Controllers
const jobTypesController = require("../controllers/job-types-controller");

// Exports
module.exports = (app, dbInstance) => {
  jobTypesController.setDbInstance(dbInstance);
  app.get("/api/job-types", jobTypesController.getJobTypes);
};
