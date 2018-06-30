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
let createParty = (request, response) => {
  // Validate
  if (
    !request.body ||
    !request.body.name ||
    !request.body.contact_person ||
    !request.body.mobile ||
    !request.body.email ||
    !request.body.address_line_1 ||
    !request.body.city ||
    !request.body.state
  ) {
    return response.status(400).json({
      message: Strings.ERRORS.MISSING_REQUIRED_FIELDS
    });
  }

  // Values
  let values = [
    `"${request.body.name}"`,
    `"${request.body.contact_person}"`,
    `"${request.body.mobile}"`,
    `"${request.body.email}"`,
    `"${request.body.gstin}"`,
    `"${request.body.address_line_1}"`,
    `"${request.body.city}"`,
    `"${request.body.state}"`,
    request.body.postal_code
  ];

  // Check if mobile is in use
  database.query(
    `SELECT * FROM parties WHERE mobile=${request.body.mobile}`,
    (error, records) => {
      if (error) {
        loggify.error(error);
        return response.sendStatus(500);
      }

      if (records && records.length) {
        return response.status(409).json({
          message: Strings.ERRORS.MOBILE_ALREADY_IN_USE
        });
      }

      // Create record
      database.query(
        `INSERT INTO parties (name, contact_person, mobile, email, gstin,address_line_1, city, state, postal_code) VALUES (${values})`,
        (error, result) => {
          if (error) {
            loggify.error(error);
            return response.sendStatus(500);
          }

          // New Record ID
          let id = result.insertId;

          // Get newly created record
          database.query(
            `SELECT * FROM parties WHERE id=${id}`,
            (error, records) => {
              if (error) {
                loggify.error(error);
                return response.sendStatus(500);
              }

              if (records && records.length) {
                return response.json(records[0]);
              }

              return response.status(404).json({
                message: Strings.ERRORS.PARTY_NOT_FOUND
              });
            }
          );
        }
      );
    }
  );
};

// Exports
module.exports = {
  setDbInstance: setDbInstance,
  getAllParties: getAllParties,
  getPartyByPhone: getPartyByPhone,
  createParty: createParty
};
