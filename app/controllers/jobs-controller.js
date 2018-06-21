// Modules
const loggify = require("agx-loggify");

// Set Database Instance
let database = null;
let setDbInstance = instance => {
  database = instance;
};

// Get Job Types
let getJobTypes = (request, response) => {
  database.query(`SELECT * FROM job_types`, (error, jobtypes) => {
    if (error) {
      loggify.error(error);
      return response.sendStatus(500);
    }
    return response.json(jobtypes);
  });
};

// Get Job Qualities
let getJobQualities = (request, response) => {
  database.query(`SELECT * FROM job_qualities`, (error, qualities) => {
    if (error) {
      loggify.error(error);
      return response.sendStatus(500);
    }
    return response.json(qualities);
  });
};

// Get Job Features
let getJobFeatures = (request, response) => {
  database.query(`SELECT * FROM job_features`, (error, features) => {
    if (error) {
      loggify.error(error);
      return response.sendStatus(500);
    }
    return response.json(features);
  });
};

// Get Units of Measurements
let getUnitsOfMeasurements = (request, response) => {
  database.query(`SELECT * FROM uom`, (error, units) => {
    if (error) {
      loggify.error(error);
      return response.sendStatus(500);
    }
    return response.json(units);
  });
};

// Get Charges
let getCharges = (request, response) => {
  database.query(`SELECT * FROM charges`, (error, charges) => {
    if (error) {
      loggify.error(error);
      return response.sendStatus(500);
    }
    return response.json(charges);
  });
};

// Exports
module.exports = {
  setDbInstance: setDbInstance,
  getJobTypes: getJobTypes,
  getJobQualities: getJobQualities,
  getJobFeatures: getJobFeatures,
  getUnitsOfMeasurements: getUnitsOfMeasurements,
  getCharges: getCharges
};
