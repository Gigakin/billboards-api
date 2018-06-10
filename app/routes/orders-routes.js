// Controllers
const ordersController = require("../controllers/orders-controller");

// Exports
module.exports = (app, dbInstance) => {
  ordersController.setDbInstance(dbInstance);
  app.get("/api/orders", ordersController.getAllOrders);
  app.get("/api/orders/:orderid", ordersController.getOrderById);
  app.post("/api/orders", ordersController.createOrder);
};
