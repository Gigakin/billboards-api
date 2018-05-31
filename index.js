// Modules
const express = require("express");
const mysql = require("mysql");
const app = express();

// Properties
const serverPort = process.env.PORT || 8000;
const constants = require("./app/constants");

// Configure Database Connection
const connection = mysql.createConnection({
  host: constants.DB.HOSTNAME,
  user: constants.DB.USER,
  password: constants.DB.PASSWORD,
  database: constants.DB.DBNAME
});

// Establish connection with database
connection.connect(error => {
  if (error) return console.log(error);

  // Start Server
  app.listen(serverPort, () => {
    return console.log(`Live on ${serverPort}`);
  });
});
