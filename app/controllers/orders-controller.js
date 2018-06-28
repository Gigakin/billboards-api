// Modules
const loggify = require("agx-loggify");

// Imports
const Strings = require("../strings");
const Methods = require("../methods");

// Set Database Instance
let database = null;
let setDbInstance = instance => {
  database = instance;
};

// Get All Orders
let getAllOrders = (request, response) => {
  database.query(`SELECT * FROM orders`, (error, orders) => {
    if (error) {
      loggify.error(error);
      return response.sendStatus(500);
    }
    let counter = 1;
    let modifiedOrders = [];
    orders.forEach(order => {
      database.query(
        `SELECT * FROM account_owners WHERE id=${order.owner};
         SELECT * FROM parties WHERE id=${order.party};
         SELECT * FROM order_statuses WHERE id=${order.status};
         SELECT * FROM jobs WHERE order_id=${order.id};
         SELECT * FROM orders
         `,
        [0, 1, 2, 3, 4],
        (error, result) => {
          if (error) {
            loggify.error(error);
            return response.sendStatus(500);
          }

          // Append properties
          order.owner = result[0][0];
          order.party = result[1][0];
          order.status = result[2][0];
          order.jobs = result[3];
          order.isHighPriority = false;

          // Set High Priority Flag
          if (result[3].length === 0) {
            order.isHighPriority = false;
          } else {
            result[3].forEach(job => {
              if (job.is_high_priority) {
                order.isHighPriority = true;
                return;
              }
            });
          }

          // Calculate charges for jobs
          order.jobs.forEach(job => {
            result[4].forEach(charge => {
              if (
                charge.job_feature == job.feature &&
                charge.job_quality == job.quality &&
                charge.job_type == job.type
              ) {
                job.rate = charge;
              }
            });
          });

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
      if (error) {
        loggify.error(error);
        return response.sendStatus(500);
      }
      if (orders && orders.length) {
        let order = orders[0];
        database.query(
          `
          SELECT * FROM account_owners WHERE id=${order.owner};
          SELECT * FROM parties WHERE id=${order.party};
          SELECT * FROM order_statuses WHERE id=${order.status};
          SELECT * FROM jobs WHERE order_id=${order.id};
          SELECT * FROM charges
        `,
          [0, 1, 2, 3, 4],
          (error, result) => {
            if (error) {
              loggify.error(error);
              return response.sendStatus(500);
            }

            // Append Properties
            order.owner = result[0][0];
            order.party = result[1][0];
            order.status = result[2][0];
            order.jobs = result[3];
            order.isHighPriority = false;

            // Set High Priority Flag
            if (result[3].length === 0) {
              order.isHighPriority = false;
            } else {
              result[3].forEach(job => {
                // Append new properties to jobs
                job.sizeWidth = job.size_width;
                job.sizeHeight = job.size_height;
                job.sizeUnits = job.size_units;

                if (job.is_high_priority) {
                  order.isHighPriority = true;
                  return;
                }
              });
            }

            // Calculate charges for jobs
            order.jobs.forEach(job => {
              result[4].forEach(charge => {
                if (
                  charge.job_feature == job.feature &&
                  charge.job_quality == job.quality &&
                  charge.job_type == job.type
                ) {
                  // calculate total amount
                  // hardcoded for now. must be
                  // calculated by conversions
                  charge.cost = 1200;
                  // Append rates
                  job.rate = charge;
                }
              });
            });

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
    `"${body.party}"`,
    body.is_designing,
    body.is_scanning
  ];
  database.query(
    `INSERT INTO orders (name, description, owner, party, is_designing, is_scanning) VALUES (${dbValues})`,
    error => {
      if (error) {
        loggify.error(error);
        return response.sendStatus(500);
      }
      return response.status(201).json({
        message: Strings.SUCCESS.ORDER_CREATED
      });
    }
  );
};

// Delete Order
let deleteOrder = (request, response) => {
  let orderId = request.params.id;

  // Delete Jobs in the order
  database.query(`DELETE FROM jobs WHERE order_id=${orderId}`, error => {
    if (error) {
      loggify.error(error);
      return response.sendStatus(500);
    }
    // Delete order
    database.query(`DELETE FROM orders WHERE id=${orderId}`, error => {
      if (error) {
        loggify.error(error);
        return response.sendStatus(500);
      }
      return response.json({
        message: Strings.SUCCESS.ORDER_DELETED
      });
    });
  });
};

// Change Order Status
let changeOrderStatus = (request, response) => {
  let orderId = request.params.id;

  // Find Order
  database.query(
    `SELECT * FROM orders WHERE id=${orderId}`,
    (error, orders) => {
      if (error) {
        loggify.error(error);
        return response.sendStatus(500);
      }

      if (orders && orders.length) {
        let order = orders[0];
        let status = request.body.status;

        // Update status
        return database.query(
          `UPDATE orders SET status = ${status} WHERE id = ${order.id}`,
          error => {
            if (error) {
              loggify.error(error);
              return response.sendStatus(500);
            }
            return response.json({
              message: Strings.SUCCESS.ORDER_STATUS_UPDATED
            });
          }
        );
      } else {
        // No orders found
        return response.status(404).json({
          message: Strings.ERRORS.ORDER_NOT_FOUND
        });
      }
    }
  );
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
      if (error) {
        loggify.error(error);
        return response.sendStatus(500);
      }
      // No orders found
      if (result && result.length === 0) {
        return response.status(404).json({
          message: Strings.ERRORS.ORDER_NOT_FOUND
        });
      }

      // Store IDs of jobs with file attahcments
      let jobsWithFiles = [];

      request.body.forEach(job => {
        let values = [
          parseInt(orderId),
          parseInt(job.quality),
          parseInt(job.quantity),
          parseInt(job.sizeUnits),
          parseInt(job.sizeWidth),
          parseInt(job.sizeHeight),
          parseInt(job.type),
          job.feature ? parseInt(job.feature) : null,
          job.isHighPriority,
          `"${job.notes}"`,
          `"${job.delivery_expected_by}"`
        ];

        // Insert into database
        database.query(
          `INSERT INTO jobs (order_id, quality, quantity, size_units, size_width, size_height, type, feature, is_high_priority, notes, delivery_expected_by) VALUES (${values})`,
          (error, result) => {
            if (error) {
              loggify.error(error);
              return response.sendStatus(500);
            }

            // Check if this job has file attachment
            if (job.hasFileAttachment) {
              jobsWithFiles.push(result.insertId);
            }

            // Send response if all jobs have been inserted
            if (counter === request.body.length) {
              return response.json({
                message: Strings.SUCCESS.JOBS_ADDED,
                jobsWithFiles: jobsWithFiles
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

// Remove Job
let removeJob = (request, response) => {
  let orderId = request.params.orderid;
  let jobId = request.params.jobid;
  // Remove from Database
  database.query(
    `DELETE FROM jobs WHERE order_id=${orderId} AND id=${jobId}`,
    error => {
      if (error) {
        loggify.error(error);
        return response.sendStatus(500);
      }
      return response.json({
        message: Strings.SUCCESS.JOB_REMOVED
      });
    }
  );
};

// Set Job Advance Amounts
let setJobAdvanceAmounts = (request, response) => {
  // Validate
  if (!request.body) {
    return response.status(400).json({
      message: Strings.ERRORS.MISSING_REQUIRED_FIELDS
    });
  }

  // Extract key values
  // Keys are the job ids (Array)
  let keys = Object.keys(request.body);

  // Save advance amounts to database
  let counter = 0;
  keys.forEach((key, index) => {
    database.query(
      `UPDATE jobs SET advance=${request.body[key]} WHERE id = ${key}`,
      error => {
        if (error) {
          loggify.error(error);
          return response.sendStatus(500);
        }
        if (counter === index) {
          return response.json({
            message: Strings.SUCCESS.ADVANCE_AMOUNT_CAPTURED
          });
        }
        counter++;
      }
    );
  });
};

// Save Customer File
let saveCustomerFile = (request, response) => {
  // Variables
  let jobId = request.params.id;
  // Validate
  if (request.file) {
    let file = request.file;
    // Save in database
    database.query(
      `INSERT INTO files (name, location, job, type) VALUES ("${
        file.filename
      }", "${file.path}", ${jobId}, 1)`,
      error => {
        if (error) {
          loggify.error(error);
          return response.sendStatus(500);
        }
        return response.json({
          message: Strings.SUCCESS.FILE_UPLOADED
        });
      }
    );
  } else {
    return response.status(400).json({
      message: Strings.ERRORS.NO_FILE_PROVIDED
    });
  }
};

// Exports
module.exports = {
  setDbInstance: setDbInstance,
  getAllOrders: getAllOrders,
  getOrderById: getOrderById,
  createOrder: createOrder,
  deleteOrder: deleteOrder,
  changeOrderStatus: changeOrderStatus,
  addJobs: addJobs,
  removeJob: removeJob,
  setJobAdvanceAmounts: setJobAdvanceAmounts,
  saveCustomerFile: saveCustomerFile
};
