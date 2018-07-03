// Controllers
const ordersController = require("../controllers/orders-controller");

// Exports
module.exports = (app, dbInstance, upload) => {
  ordersController.setDbInstance(dbInstance);
  // ordersController.setUploadsInstance(upload);
  app.get("/api/orders", ordersController.getAllOrders);
  app.get("/api/orders/:id", ordersController.getOrderById);
  app.post("/api/orders", ordersController.createOrder);
  app.post("/api/orders/:id/status", ordersController.changeOrderStatus);
  app.delete("/api/orders/:id", ordersController.deleteOrder);
  app.post("/api/orders/:id/jobs", ordersController.addJobs);
  app.post(
    "/api/orders/:id/jobs/advance",
    ordersController.setJobAdvanceAmounts
  );
  app.delete("/api/orders/:orderid/jobs/:jobid", ordersController.removeJob);

  // Jobs Files
  app.post(
    "/api/orders/:orderid/jobs/:jobid/files/customer",
    upload.single("file"),
    ordersController.saveCustomerFile
  );
  app.post(
    "/api/orders/:orderid/jobs/:jobid/files/designer",
    upload.single("file"),
    ordersController.saveDesignerFile
  );
  app.post(
    "/api/orders/:orderid/jobs/:jobid/files/printer",
    upload.single("file"),
    ordersController.savePrinterFile
  );

  // Handovers
  app.post("/api/orders/:id/jobs/handovers", ordersController.handoverJobs);
};
