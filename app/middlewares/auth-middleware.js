// Modules
const jwt = require("jsonwebtoken");

// Imports
const Strings = require("../strings");
const Constants = require("../constants");

// Authentication Header Check
let authorizationCheck = (request, response, next) => {
  let { headers } = request;

  // Validate
  if (!headers.authorization) return response.sendStatus(401);

  // Verify Token
  jwt.verify(headers.authorization, Constants.JWT.SECRET_KEY, error => {
    if (error) {
      return response.status(401).json({
        message: Strings.ERRORS.INVALID_TOKEN
      });
    }
    return next();
  });
};

// Exports
module.exports = {
  authorizationCheck: authorizationCheck
};
