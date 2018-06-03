// Controllers
const authController = require("../controllers/auth-controller");

// Exports
module.exports = (app, db) => {
  authController.setDbInstance(db);
  app.post("/auth/login", authController.login);
}
 