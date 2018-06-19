// Modules
const jwt = require("jsonwebtoken");
const loggify = require("agx-loggify");

// Imports
const Strings = require("../strings");
const Constants = require("../constants");

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
      if (error) {
        loggify.error(error);
        return response.sendStatus(500);
      }
      if (users && users.length) {
        // Match passwords
        if (request.body.password !== users[0].password) {
          return response.status(401).json({
            message: Strings.ERRORS.WRONG_PASSWORD
          });
        }

        // Create JWT
        let token = jwt.sign(
          // User details
          { id: users[0].id },
          // Signing Key
          Constants.JWT.SECRET_KEY,
          // Token Details
          { expiresIn: 3600 * 24 }
        );

        // Get User Role
        database.query(
          `SELECT * FROM user_roles WHERE id="${users[0].role}"`,
          (error, userrole) => {
            if (error) {
              loggify.error(error);
              return response.sendStatus(500);
            }

            if (userrole) {
              // Update user role
              users[0].role = userrole[0].role;

              // Return user details
              return response.json({
                expiresIn: 3600 * 24,
                access_token: token,
                refresh_token: null,
                user: users[0]
              });
            } else {
              // Internal Server Error
              return response.sendStatus(500);
            }
          }
        );
      } else {
        return response.status(404).json({
          message: Strings.ERRORS.USER_NOT_FOUND
        });
      }
    }
  );
};

// Exports
module.exports = {
  login: login,
  setDbInstance: setDbInstance
};
