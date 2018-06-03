// Modules
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const app = express();

// Properties
const serverPort = process.env.PORT || 8000;
const constants = require("./app/constants");

// Configure Database Connection
const connection = mysql.createConnection({
  host: constants.DB.HOST,
  user: constants.DB.USER,
  password: constants.DB.PASSWORD,
  database: constants.DB.DBNAME
});

// Parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Establish connection with database
connection.connect(error => {
  if (error) return console.log(error);

  // CORS Configuration
  const cors = require("./app/cors");
  app.use(cors);

  // Middlewares
  require("./app/middlewares")(app, connection);

  // Routes
  require("./app/routes")(app, connection);

  // Start Server
  app.listen(serverPort, () => {
    return console.log(`Live on ${serverPort}`);
  });
});
