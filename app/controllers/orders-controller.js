// Imports
const Strings = require("../strings");
const Constants = require("../constants");

// Set Database Instance
let database = null;
let setDbInstance = instance => {
  database = instance;
};

// Get All Orders
let getAllOrders = (request, response) => {
  database.query(`SELECT * FROM orders`, (error, orders) => {
    if (error) return response.sendStatus(500);
    return response.json(orders);
  });
};

// Get Order By ID
let getOrderById = (request, response) => {
  database.query(
    `SELECT * FROM orders WHERE id="${request.params.orderid}"`,
    (error, orders) => {
      if (error) return response.sendStatus(500);
      return response.json(orders[0]);
    }
  );
};

// Create Order
let createOrder = (request, response) => {
  let { body } = request;

  // Validate: Order Details
  if (!body.name || !body.description || !body.owner || !body.party) {
    return response.status(400).json({
      message: Strings.ERRORS.MISSING_REQUIRED_FIELDS
    });
  }

  // Create order in DB
  let dbValues = [
    `"${body.name}"`,
    `"${body.description}"`,
    `"${body.owner}"`,
    `"${body.party}"`
  ];
  database.query(
    `INSERT INTO orders (name, description, owner, party) VALUES (${dbValues})`,
    error => {
      if (error) {
        console.log(error);
        return response.sendStatus(500);
      }
      return response.json({
        message: Strings.SUCCESS.ORDER_CREATED
      });
    }
  );
};

// Exports
module.exports = {
  setDbInstance: setDbInstance,
  getAllOrders: getAllOrders,
  getOrderById: getOrderById,
  createOrder: createOrder
};
