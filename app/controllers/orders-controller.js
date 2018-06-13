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
    let counter = 1;
    let modifiedOrders = [];
    orders.forEach(order => {
      database.query(
        `SELECT * FROM account_owners WHERE id=${order.owner};
         SELECT * FROM parties WHERE id=${order.party};
         SELECT * FROM order_statuses WHERE id=${order.status}
         `,
        [0, 1, 2],
        (error, result) => {
          if (error) return response.sendStatus(500);
          // Append properties
          order.owner = result[0][0];
          order.party = result[1][0];
          order.status = result[2][0];
          // Push to modified orders
          modifiedOrders.push(order);
          // Send response if all orders have been modified
          if (orders.length === counter) return response.json(orders);
          // otherwise increment the counter and loop
          counter++;
        }
      );
    });
  });
};

// Get Order By ID
let getOrderById = (request, response) => {
  database.query(
    `SELECT * FROM orders WHERE id="${request.params.id}"`,
    (error, orders) => {
      if (error) return response.sendStatus(500);
      if (orders && orders.length) {
        let order = orders[0];
        database.query(
          `
          SELECT * FROM account_owners WHERE id=${order.owner};
          SELECT * FROM parties WHERE id=${order.party};
          SELECT * FROM order_statuses WHERE id=${order.status};
        `,
          [0, 1, 2],
          (error, result) => {
            if (error) return response.sendStatus(500);
            // Append Properties
            order.owner = result[0][0];
            order.party = result[1][0];
            order.status = result[2][0];
            // Send response
            response.json(order);
          }
        );
      } else {
        response.status(404).json({
          message: Strings.ERRORS.ORDER_NOT_FOUND
        });
      }
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
      if (error) return response.sendStatus(500);
      return response.json({
        message: Strings.SUCCESS.ORDER_CREATED
      });
    }
  );
};

// Delete Order
let deleteOrder = (request, response) => {
  let orderId = request.params.id;
  database.query(`DELETE FROM orders WHERE id=${orderId}`, (error, result) => {
    if (error) return response.sendStatus(500);
    return response.json({ message: Strings.SUCCESS.ORDER_DELETED });
  });
};

// Exports
module.exports = {
  setDbInstance: setDbInstance,
  getAllOrders: getAllOrders,
  getOrderById: getOrderById,
  createOrder: createOrder,
  deleteOrder: deleteOrder
};
