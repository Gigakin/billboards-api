// Controllers
const accountOwnersController = require("../controllers/account-owners-controller");

// Exports
module.exports = (app, dbInstance) => {
  accountOwnersController.setDbInstance(dbInstance);
  app.get("/api/account-owners", accountOwnersController.getAccountOwners);
};
