// Modules
const loggify = require("agx-loggify");
const moment = require("moment");

// Imports
const Strings = require("../strings");
const Constants = require("../constants");
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
         SELECT * FROM payments WHERE order_id=${order.id};
         SELECT * FROM files WHERE order_id=${order.id};
         SELECT * FROM orders
         `,
        [0, 1, 2, 3, 4, 5, 6],
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
          order.payments = result[4];
          order.files = result[5];
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
            result[6].forEach(charge => {
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
          SELECT * FROM payments WHERE order_id=${order.id};
          SELECT * FROM files WHERE order_id=${order.id};
          SELECT * FROM charges
        `,
          [0, 1, 2, 3, 4, 5, 6],
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
            order.payments = result[4];
            order.files = result[5];
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
                job.totalSizeInSqFt =
                  Methods.calculateSqFt(job.size_width, job.size_units) *
                  Methods.calculateSqFt(job.size_height, job.size_units);

                if (job.is_high_priority) {
                  order.isHighPriority = true;
                  return;
                }
              });
            }

            // Calculate charges for jobs
            order.jobs.forEach(job => {
              result[6].forEach(charge => {
                if (
                  charge.job_feature == job.feature &&
                  charge.job_quality == job.quality &&
                  charge.job_type == job.type
                ) {
                  if (job.rate && job.rate > 0) charge.charge = job.rate;
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
    body.is_scanning,
    `"${moment(Date.now())}"`
  ];
  database.query(
    `INSERT INTO orders (name, description, owner, party, is_designing, is_scanning, created_on) VALUES (${dbValues})`,
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
      let values = [];
      let jobsWithFiles = [];
      let breakLoop = false;
      request.body.forEach(job => {
        // Break the loop, so as to prevent
        // multiple request headers sent
        if (breakLoop) return;

        if (!job.isUploaded) {
          values = [
            parseInt(orderId),
            parseInt(job.quality),
            parseInt(job.quantity),
            parseInt(job.sizeUnits),
            parseInt(job.sizeWidth),
            parseInt(job.sizeHeight),
            parseInt(job.type),
            job.feature ? parseInt(job.feature) : "NULL",
            job.isHighPriority,
            `"${job.notes}"`,
            job.delivery_expected_by ? `"${job.delivery_expected_by}"` : "NULL"
          ];
        }

        if (values && values.length) {
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
        } else {
          breakLoop = true;
          return response.sendStatus(200);
        }
      });
    }
  );
};

// Remove Job
let removeJob = (request, response) => {
  let orderId = request.params.orderid;
  let jobId = request.params.jobid;

  // Check if job has file attachments
  // If it does, delete files
  database.query(`DELETE FROM files WHERE job = ${jobId}`, error => {
    if (error) {
      loggify.error(error);
      return response.sendStatus(500);
    }

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
  });
};

// Set Job Advance Amounts
let setJobAdvanceAmounts = (request, response) => {
  // Validate
  if (!request.body) {
    return response.status(400).json({
      message: Strings.ERRORS.MISSING_REQUIRED_FIELDS
    });
  }

  // Create data model
  let jobsArray = request.body.map(job => {
    return {
      id: job.id,
      orderId: request.params.id,
      advance: Math.ceil(job.advance),
      rate: job.rate.charge
    };
  });

  // Save Rate to db
  let counter = 0;
  jobsArray.forEach((job, index) => {
    database.query(
      `UPDATE jobs SET rate=${job.rate} WHERE id=${job.id}`,
      error => {
        if (error) {
          loggify.error(error);
          return response.sendStatus(500);
        }
        if (counter === index) return;
        counter++;
      }
    );
  });

  // Save payment to database
  counter = 0;
  console.log(counter);
  jobsArray.forEach((job, index) => {
    database.query(
      `INSERT INTO payments (order_id, job_id, amount, paid_on) VALUES (${
        job.orderId
      }, ${job.id}, ${job.advance}, "${moment(Date.now())}")`,
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
  let orderId = request.params.orderid;
  let jobId = request.params.jobid;

  // Validate
  if (!request.file) {
    return response.status(400).json({
      message: Strings.ERRORS.NO_FILE_PROVIDED
    });
  }

  // Values
  let file = request.file;
  let values = [
    `"${file.filename}"`,
    `"${Constants.BASE_URL}/${file.path}"`,
    jobId,
    orderId,
    1
  ];

  // Check if file is already provided
  database.query(
    `SELECT * FROM files WHERE job=${jobId} AND order_id=${orderId} AND type=${
      values[4]
    }`,
    (error, records) => {
      if (error) {
        loggify.error(error);
        return response.sendStatus(500);
      }
      if (records && records.length) {
        // Files record exists
        database.query(
          `UPDATE files SET name=${values[0]}, location=${
            values[1]
          } WHERE job=${jobId} AND order_id=${orderId} AND type=${values[4]}`,
          error => {
            if (error) {
              loggify.error(error);
              return response.sendStatus(500);
            }
            return response.json({
              message: Strings.SUCCESS.FILE_UPDATED
            });
          }
        );
      } else {
        // Save in Database
        database.query(
          `INSERT INTO files (name, location, job, order_id, type) VALUES (${values})`,
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
      }
    }
  );
};

// Save Designer File
let saveDesignerFile = (request, response) => {
  // Variables
  let orderId = request.params.orderid;
  let jobId = request.params.jobid;

  // Validate
  if (!request.file) {
    return response.status(400).json({
      message: Strings.ERRORS.NO_FILE_PROVIDED
    });
  }

  // Values
  let file = request.file;
  let values = [
    `"${file.filename}"`,
    `"${Constants.BASE_URL}/${file.path}"`,
    jobId,
    orderId,
    2
  ];

  // Check if file is already provided
  database.query(
    `SELECT * FROM files WHERE job=${jobId} AND order_id=${orderId} AND type=${
      values[4]
    }`,
    (error, records) => {
      if (error) {
        loggify.error(error);
        return response.sendStatus(500);
      }
      if (records && records.length) {
        // Files record exists
        database.query(
          `UPDATE files SET name=${values[0]}, location=${
            values[1]
          } WHERE job=${jobId} AND order_id=${orderId} AND type=${values[4]}`,
          error => {
            if (error) {
              loggify.error(error);
              return response.sendStatus(500);
            }
            return response.json({
              message: Strings.SUCCESS.FILE_UPDATED
            });
          }
        );
      } else {
        // Save in Database
        database.query(
          `INSERT INTO files (name, location, job, order_id, type) VALUES (${values})`,
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
      }
    }
  );
};

// Save Printer File
let savePrinterFile = (request, response) => {
  // Variables
  let orderId = request.params.orderid;
  let jobId = request.params.jobid;

  // Validate
  if (!request.file) {
    return response.status(400).json({
      message: Strings.ERRORS.NO_FILE_PROVIDED
    });
  }

  // Values
  let file = request.file;
  let values = [
    `"${file.filename}"`,
    `"${Constants.BASE_URL}/${file.path}"`,
    jobId,
    orderId,
    3
  ];

  // Check if file is already provided
  database.query(
    `SELECT * FROM files WHERE job=${jobId} AND order_id=${orderId} AND type=${
      values[4]
    }`,
    (error, records) => {
      if (error) {
        loggify.error(error);
        return response.sendStatus(500);
      }
      if (records && records.length) {
        // Files record exists
        database.query(
          `UPDATE files SET name=${values[0]}, location=${
            values[1]
          } WHERE job=${jobId} AND order_id=${orderId} AND type=${values[4]}`,
          error => {
            if (error) {
              loggify.error(error);
              return response.sendStatus(500);
            }
            return response.json({
              message: Strings.SUCCESS.FILE_UPDATED
            });
          }
        );
      } else {
        // Save in Database
        database.query(
          `INSERT INTO files (name, location, job, order_id, type) VALUES (${values})`,
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
      }
    }
  );
};

// Handover Jobs
const handoverJobs = (request, response) => {
  // Validate
  if (
    !request.body ||
    !request.body.id ||
    !request.body.amount_received ||
    !request.body.payment_mode
  ) {
    return response.status(400).json({
      message: Strings.ERRORS.MISSING_REQUIRED_FIELDS
    });
  }

  let orderId = request.params.id;
  let paymentMode = `"${request.body.payment_mode}"`;
  let paymentModeDetails = `"${request.body.payment_mode_details}"`;
  let amountReceived = Math.ceil(request.body.amount_received);
  let paidOn = `"${moment(Date.now())}"`;
  let jobId = request.body.id;

  // Update fields
  database.query(
    `INSERT INTO payments (order_id, job_id, amount, paid_on, payment_mode, payment_mode_details) VALUES (${orderId},${jobId}, ${amountReceived}, ${paidOn}, ${paymentMode}, ${paymentModeDetails})`,
    error => {
      if (error) {
        loggify.error(error);
        return response.sendStatus(500);
      }

      // Update handover status
      database.query(
        `UPDATE jobs SET is_handed_over=${true} WHERE id=${jobId}`,
        error => {
          if (error) {
            loggify.error(error);
            return response.sendStatus(500);
          }
          return response.json({
            message: Strings.SUCCESS.JOBS_HANDED_OVER
          });
        }
      );
    }
  );
};

// Accept Payments
const acceptPayments = (request, response) => {
  // Validate
  if (!request.body || !request.body.amount_received) {
    return response.status(400).json({
      message: Strings.ERRORS.MISSING_REQUIRED_FIELDS
    });
  }

  // Variables
  let orderId = request.params.orderid;
  let amount = Math.ceil(request.body.amount_received);
  let jobId = request.params.jobid;

  // Query
  database.query(
    `INSERT INTO payments (order_id, job_id, amount, paid_on) VALUES (${orderId}, ${jobId}, ${amount}, "${moment(
      Date.now()
    )}")`,
    error => {
      if (error) {
        loggify.error(error);
        return response.sendStatus(500);
      }
      // Mark job as paid
      database.query(
        `UPDATE jobs SET is_paid=${true} WHERE id=${jobId}`,
        error => {
          if (error) {
            loggify.error(error);
            return response.sendStatus(500);
          }
          return response.json({
            message: Strings.SUCCESS.PAYMENT_ACCEPTED
          });
        }
      );
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
  changeOrderStatus: changeOrderStatus,
  addJobs: addJobs,
  removeJob: removeJob,
  setJobAdvanceAmounts: setJobAdvanceAmounts,
  saveCustomerFile: saveCustomerFile,
  saveDesignerFile: saveDesignerFile,
  savePrinterFile: savePrinterFile,
  handoverJobs: handoverJobs,
  acceptPayments: acceptPayments
};
