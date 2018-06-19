// Modules
const loggify = require("agx-loggify");

// Set Database Instance
let database = null;
let setDbInstance = instance => {
  database = instance;
};

// Get Account Owners
let getAccountOwners = (request, response) => {
  database.query(`SELECT * FROM account_owners`, (error, owners) => {
    if (error) {
      loggify.error(error);
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
