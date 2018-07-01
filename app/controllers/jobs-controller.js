// Modules
const loggify = require("agx-loggify");

// Assets
const Strings = require("../strings");

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

// Change Status
let changeJobStatus = (request, response) => {
  // Validate
  if (!request.body && !request.body.status) {
    return response.status(400).json({
      message: Strings.ERRORS.MISSING_REQUIRED_FIELDS
    });
  }

  // Variables
  let jobId = request.params.id;
  let statusId = request.body.status;

  // Check if job exists
  database.query(`SELECT * FROM jobs WHERE id=${jobId}`, (error, records) => {
    if (error) {
      loggify.error(error);
      return response.sendStatus(500);
    }

    if (records && records.length) {
      let job = records[0];
      database.query(
        `UPDATE jobs SET status=${statusId} WHERE id=${jobId}`,
        error => {
          if (error) {
            loggify.error(error);
            return response.sendStatus(500);
          }

          return response.json({
            message: Strings.SUCCESS.JOB_STATUS_CHANGED
          });
        }
      );
    } else {
      return response.status(404).json({
        message: Strings.ERRORS.JOB_NOT_FOUND
      });
    }
  });
};

// Exports
module.exports = {
  setDbInstance: setDbInstance,
  getJobTypes: getJobTypes,
  getJobQualities: getJobQualities,
  getJobFeatures: getJobFeatures,
  getUnitsOfMeasurements: getUnitsOfMeasurements,
  getCharges: getCharges,
  changeJobStatus: changeJobStatus
};
