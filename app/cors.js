// Configure CORS
let configure = (request, response, next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Content-Type, Authorization, Content-Length, X-Requested-With");
  response.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PATCH,OPTIONS");

  // Intercept OPTIONS requests
  if (request.method === "OPTIONS") return response.sendStatus(200);
  return next();
};

// Exports
module.exports = configure;
