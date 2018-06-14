// Set Database Instance
let database = null;
let setDbInstance = instance => {
  database = instance;
};

// Get Job Types
let getJobTypes = (request, response) => {
  database.query(`SELECT * FROM job_types`, (error, jobtypes) => {
    if (error) return response.sendStatus(500);
    return response.json(jobtypes);
  });
};

// Exports
module.exports = {
  setDbInstance: setDbInstance,
  getJobTypes: getJobTypes
};
