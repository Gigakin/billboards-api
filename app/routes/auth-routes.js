// Controllers
const authController = require("../controllers/auth-controller");

// Exports
module.exports = (app, dbInstance) => {
  authController.setDbInstance(dbInstance);
  app.post("/auth/login", authController.login);
}
 