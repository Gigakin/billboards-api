// Modules
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const app = express();

// Properties
const serverPort = process.env.PORT || 8000;
const constants = require("./app/constants");

// CORS Configuration
const cors = require("./app/cors");
app.use(cors);

// Configure Database Connection
const connection = mysql.createConnection({
  host: constants.DB.HOST,
  user: constants.DB.USER,
  password: constants.DB.PASSWORD,
  database: constants.DB.DBNAME,
  multipleStatements: true
});

// Authenticated Routing
const securedRoutes = express.Router();
app.use("/api", securedRoutes);

// Parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Establish connection with database
connection.connect(error => {
  if (error) return console.log(error);

  // Initialize Logger
  const Logger = require("./app/services/logger");
  if (!Logger.logDirectoryExists()) {
    return Logger.createLogDirectory();
  }

  // Middlewares
  require("./app/middlewares")(app, securedRoutes, connection);

  // Routes
  require("./app/routes")(app, securedRoutes, connection);

  // Start Server
  app.listen(serverPort, () => {
    return console.log(`Live on ${serverPort}`);
  });
});
