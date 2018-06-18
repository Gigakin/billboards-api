// Imports
const Logger = require("../services/logger");

// Set Database Instance
let database = null;
let setDbInstance = instance => {
  database = instance;
};

// Get Job Types
let getJobTypes = (request, response) => {
  database.query(`SELECT * FROM job_types`, (error, jobtypes) => {
    if (error) {
      Logger.writeError(error);
      return response.sendStatus(500);
    }
    return response.json(jobtypes);
  });
};

// Get Job Qualities
let getJobQualities = (request, response) => {
  database.query(`SELECT * FROM job_qualities`, (error, qualities) => {
    if (error) {
      Logger.writeError(error);
      return response.sendStatus(500);
    }
    return response.json(qualities);
  });
};

// Get Units of Measurements
let getUnitsOfMeasurements = (request, response) => {
  database.query(`SELECT * FROM uom`, (error, units) => {
    if (error) {
      Logger.writeError(error);
      return response.sendStatus(500);
    }
    return response.json(units);
  });
};

// Exports
module.exports = {
  setDbInstance: setDbInstance,
  getJobTypes: getJobTypes,
  getJobQualities: getJobQualities,
  getUnitsOfMeasurements: getUnitsOfMeasurements
};
