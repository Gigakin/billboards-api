// Modules
const loggify = require("agx-loggify");

// Imports
const Strings = require("../strings");

// Set Database Instance
let database = null;
let setDbInstance = instance => {
  database = instance;
};

// Get All Parties
let getAllParties = (request, response) => {
  database.query(`SELECT * FROM parties`, (error, parties) => {
    if (error) {
      loggify.error(error);
      return response.sendStatus(500);
    }
    return response.json(parties);
  });
};

// Get Party By Phone
let getPartyByPhone = (request, response) => {
  // Validate
  if (!request.body || !request.body.phone) {
    return response.status(400).json({
      message: Strings.ERRORS.MISSING_REQUIRED_FIELDS
    });
  }

  // Get Parties
  database.query(
    `SELECT * FROM parties WHERE mobile LIKE "${request.body.phone}"`,
    (error, parties) => {
      if (error) {
        loggify.error(error);
        return response.sendStatus(500);
      }
      return response.json(parties);
    }
  );
};

// Create Party
let createParty = (request, response) => {};

// Exports
module.exports = {
  setDbInstance: setDbInstance,
  getAllParties: getAllParties,
  getPartyByPhone: getPartyByPhone,
  createParty: createParty
};
