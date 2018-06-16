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
         SELECT * FROM order_statuses WHERE id=${order.status};
         SELECT * FROM jobs WHERE order_id=${order.id}
         `,
        [0, 1, 2, 3],
        (error, result) => {
          if (error) return response.sendStatus(500);

          // Append properties
          order.owner = result[0][0];
          order.party = result[1][0];
          order.status = result[2][0];
          order.isHighPriority = false;

          // Set High Priority Flag
          if (result[3].length === 0) {
            order.isHighPriority = false;
          } else {
            result[3].forEach(job => {
              if (job.is_high_priority) {
                order.is_high_priority = true;
                return;
              }
            });
          }

          // Push to modified orders
          modifiedOrders.push(order);
          // Send response if all orders have been modified
          if (orders.length === counter) return response.json(modifiedOrders);
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
      return response.status(201).json({
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

// Add Jobs
let addJobs = (request, response) => {
  // Validate
  if (!request.body) {
    return response.status(400).json({
      message: Strings.ERRORS.MISSING_REQUIRED_FIELDS
    });
  }

  // Extract Order ID
  let orderId = request.params.id;
  let counter = 1;

  // Check if Order exists
  database.query(
    `SELECT * FROM orders WHERE id=${orderId}`,
    (error, result) => {
      if (error) return response.sendStatus(500);
      if (result && result.length === 0) {
        return response.status(404).json({
          message: Strings.ERRORS.ORDER_NOT_FOUND
        });
      }

      request.body.forEach(job => {
        let values = [
          parseInt(orderId),
          parseInt(job.quality),
          parseInt(job.quantity),
          parseInt(job.sizeUnits),
          parseInt(job.sizeWidth),
          parseInt(job.sizeHeight),
          parseInt(job.type),
          job.isHighPriority,
          `"${job.notes}"`
        ];

        // Insert into database
        database.query(
          `INSERT INTO jobs (order_id, quality, quantity, size_units, size_width, size_height, type, is_high_priority, notes) VALUES (${values})`,
          error => {
            if (error) return response.sendStatus(500);
            // Send response if all jobs have been inserted
            if (counter === request.body.length) {
              return response.json({
                message: Strings.SUCCESS.JOBS_ADDED
              });
            }
            // otherise increment counter and loop
            counter++;
          }
        );
      });
    }
  );
};

// Exports
module.exports = {
  setDbInstance: setDbInstance,
  getAllOrders: getAllOrders,
  getOrderById: getOrderById,
  createOrder: createOrder,
  deleteOrder: deleteOrder,
  addJobs: addJobs
};
