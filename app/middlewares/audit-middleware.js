// Modules
const jwt = require("jsonwebtoken");

// Imports
const Constants = require("../constants");

// Set Database Instance
let database = null;
let setDbInstance = instance => {
  database = instance;
};

// Audit Requests
let auditRequests = (request, response, next) => {
  if (database) {
    let { method, url, headers } = request;

    // Do not log get requests
    // Unnecessarily increases db size
    if (method && method === "GET") {
      return next();
    }

    // Extract User ID
    let userid = 0;
    if (headers && headers.authorization) {
      let decodedToken = jwt.decode(
        headers.authorization,
        Constants.JWT.SECRET_KEY
      );
      userid = decodedToken.id;
    }

    // TODO: Extract User ID and
    // replace it with 0 in dbVaulues
    let dbValues = [userid, `"${method}"`, `"${url}"`, `"${headers.host}"`];

    // Insert into DB
    database.query(
      `INSERT INTO audits (userid, method, resource_url, host_url) VALUES(${dbValues})`
    );
  }

  // Continue
  return next();
};

// Exports
module.exports = {
  auditRequests: auditRequests,
  setDbInstance: setDbInstance
};
