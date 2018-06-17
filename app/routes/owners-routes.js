// Controllers
const ownersController = require("../controllers/owners-controller");

// Exports
module.exports = (app, dbInstance) => {
  ownersController.setDbInstance(dbInstance);
  app.get("/api/account-owners", ownersController.getAccountOwners);
};
