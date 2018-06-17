// Controllers
const ordersController = require("../controllers/orders-controller");

// Exports
module.exports = (app, dbInstance) => {
  ordersController.setDbInstance(dbInstance);
  app.get("/api/orders", ordersController.getAllOrders);
  app.get("/api/orders/:id", ordersController.getOrderById);
  app.post("/api/orders", ordersController.createOrder);
  app.delete("/api/orders/:id", ordersController.deleteOrder);
  app.post("/api/orders/:id/jobs", ordersController.addJobs);
  app.delete("/api/orders/:orderid/jobs/:jobid", ordersController.removeJob);
};
