// Controllers
const jobsController = require("../controllers/jobs-controller");

// Exports
module.exports = (app, dbInstance) => {
  jobsController.setDbInstance(dbInstance);
  app.get("/api/jobs/types", jobsController.getJobTypes);
  app.get("/api/jobs/qualities", jobsController.getJobQualities);
  app.get("/api/jobs/features", jobsController.getJobFeatures);
  app.get("/api/jobs/uoms", jobsController.getUnitsOfMeasurements);
  app.get("/api/jobs/charges", jobsController.getCharges);
};
