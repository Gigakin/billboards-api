// Set Database Instance
let database = null;
let setDbInstance = instance => {
  database = instance;
};

// Audit Requests
let auditRequests = (request, response, next) => {
  if (database) {
    let { method, url, headers } = request;

    // TODO: Extract User ID and
    // replace it with 0 in dbVaulues
    let dbValues = [0, `"${method}"`, `"${url}"`, `"${headers.host}"`];

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
