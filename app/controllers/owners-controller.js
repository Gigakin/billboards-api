// Imports
const Logger = require("../services/logger");

// Set Database Instance
let database = null;
let setDbInstance = instance => {
  database = instance;
};

// Get Account Owners
let getAccountOwners = (request, response) => {
  database.query(`SELECT * FROM account_owners`, (error, owners) => {
    if (error) {
      Logger.writeError(error);
      return response.sendStatus(500);
    }
    return response.json(owners);
  });
};

// Exports
module.exports = {
  setDbInstance: setDbInstance,
  getAccountOwners: getAccountOwners
};
