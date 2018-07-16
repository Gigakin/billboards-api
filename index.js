// Modules
const express = require("express");
const bodyParser = require("body-parser");
const loggify = require("agx-loggify");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mysql = require("mysql");
const app = express();

// Properties
const serverPort = process.env.PORT || 8000;
const constants = require("./app/constants");

// Initialize Logger
loggify.start("logs", ".txt");

// CORS Configuration
const cors = require("./app/cors");
app.use(cors);

// Configure Storage
const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    // Check if folder exists
    if (!fs.existsSync("uploads")) {
      fs.mkdirSync("./uploads/");
    }
    callback(null, "uploads");
  },
  filename: (request, file, callback) => {
    let extension = path.extname(file.originalname);
    let fileName = `${file.originalname}_${Date.now()}`;
    callback(null, `${fileName}${extension}`);
  }
});
const uploads = multer({ storage: storage });

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
  if (error) {
    loggify.error(error);
    return console.log(error);
  }

  // Static Content
  app.use("/uploads", express.static("./uploads"));

  // Middlewares
  require("./app/middlewares")(app, securedRoutes, connection);

  // Routes
  require("./app/routes")(app, securedRoutes, connection, uploads);

  // Start Server
  app.listen(serverPort, () => {
    return console.log(`Live on ${serverPort}`);
  });
});
