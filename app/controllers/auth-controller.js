// Imports
const Strings = require("../strings");

// Set Database Instance
let database = null;
let setDbInstance = instance => {
  database = instance;
};

// Login
let login = (request, response) => {
  // Validate
  if (!request.body.username || !request.body.password) {
    return response.status(400).json({
      message: Strings.ERRORS.MISSING_REQUIRED_FIELDS
    });
  }

  // Find user by username
  database.query(
    `SELECT * FROM users WHERE email="${request.body.username}"`,
    (error, users) => {
      if (error) return response.sendStatus(500);
      if (users && users.length) {
        // Match passwords
        if (request.body.password !== users[0].password) {
          return response.status(401).json({
            message: Strings.ERRORS.WRONG_PASSWORD
          });
        }
        // Return user details
        return response.send(users[0]);
      }
      return response.status(404).json({
        message: Strings.ERRORS.USER_NOT_FOUND
      });
    }
  );
};

// Exports
module.exports = {
  login: login,
  setDbInstance: setDbInstance
};
