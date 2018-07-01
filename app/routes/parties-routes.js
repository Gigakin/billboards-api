// Controllers
const partiesController = require("../controllers/parties-controller");

// Exports
module.exports = (app, dbInstance) => {
  partiesController.setDbInstance(dbInstance);
  app.get("/api/parties", partiesController.getAllParties);
  app.post("/api/parties/:id", partiesController.getPartyById);
  app.post("/api/parties/phone", partiesController.getPartyByPhone);
  app.post("/api/parties", partiesController.createParty);
};
